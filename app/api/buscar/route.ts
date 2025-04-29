import { promises as fs } from "fs";
import path from "path";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  const folderPath = path.join(process.cwd(), "public/json");
  const files = await fs.readdir(folderPath);

  let allUsers: any[] = [];

  for (const file of files) {
    if (file.endsWith(".json")) {
      const fileData = await fs.readFile(path.join(folderPath, file), "utf-8");
      const users = JSON.parse(fileData);
      allUsers = allUsers.concat(users);
    }
  }

  const mappedUsers = allUsers.map((user) => ({
    avatar_url: user.avatar_url,
    user_id: user.user_id,
    name: user.name,
    username: user.username,
    followers_count: user.followers_count || 0,
    profile_url: user.profile_url,
  }));

  const uniqueUsers = Array.from(new Map(mappedUsers.map(u => [u.user_id, u])).values());

  const results = query
    ? uniqueUsers.filter((user) =>
        [user.name, user.username, user.user_id.toString()].some((field) =>
          field.toLowerCase().includes(query)
        )
      )
    : uniqueUsers;

  return new Response(JSON.stringify(results), { status: 200 });
}
