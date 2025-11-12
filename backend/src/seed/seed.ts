import sharp from "sharp";
import { AppDataSource } from "../config/data-source";
import { ensureMediaBucket, uploadBuffer } from "../services/storageService";
import { User } from "../entities/User";
import { Follow } from "../entities/Follow";
import { Post } from "../entities/Post";
import { hashPassword } from "../utils/password";
import { enqueueImageJob } from "../queues/imageQueue";
import { logger } from "../utils/logger";

const placeholderColors = ["#FF6B6B", "#4ECDC4", "#FFD93D"];

const createPlaceholder = async (color: string) =>
  sharp({
    create: {
      width: 1080,
      height: 1080,
      channels: 3,
      background: color
    }
  })
    .jpeg()
    .toBuffer();

async function seed() {
  await AppDataSource.initialize();
  await ensureMediaBucket();

  const userRepo = AppDataSource.getRepository(User);
  const followRepo = AppDataSource.getRepository(Follow);
  const postRepo = AppDataSource.getRepository(Post);

  const existingUsers = await userRepo.count();
  if (existingUsers > 0) {
    logger.info("Seed skipped - users already exist");
    await AppDataSource.destroy();
    return;
  }

  const users = [
    { email: "alice@example.com", username: "alice", password: "Password123!" },
    { email: "bob@example.com", username: "bob", password: "Password123!" },
    { email: "carol@example.com", username: "carol", password: "Password123!" }
  ];

  const savedUsers: User[] = [];

  for (const user of users) {
    const passwordHash = await hashPassword(user.password);
    const entity = userRepo.create({ email: user.email, username: user.username, passwordHash });
    savedUsers.push(await userRepo.save(entity));
  }

  await followRepo.save(
    followRepo.create({ follower: savedUsers[0], following: savedUsers[1] })
  );
  await followRepo.save(
    followRepo.create({ follower: savedUsers[0], following: savedUsers[2] })
  );
  await followRepo.save(
    followRepo.create({ follower: savedUsers[1], following: savedUsers[2] })
  );

  const placeholders = await Promise.all(placeholderColors.map(createPlaceholder));

  for (let i = 0; i < placeholders.length; i++) {
    const owner = savedUsers[i % savedUsers.length];
    const buffer = placeholders[i];
    const key = `seed/${owner.username}-${Date.now()}-${i}.jpg`;
    await uploadBuffer(key, buffer, "image/jpeg");

    const post = postRepo.create({
      author: owner,
      caption: `Sample post ${i + 1} from ${owner.username}`,
      mediaKey: key,
      thumbnailKey: null,
      mediumKey: null
    });

    const saved = await postRepo.save(post);
    await enqueueImageJob({ postId: saved.id, mediaKey: key });
  }

  logger.info("Seed completed");
  await AppDataSource.destroy();
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });

