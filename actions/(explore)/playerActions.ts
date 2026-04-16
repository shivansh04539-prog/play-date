"use server"
import { dbConnect } from "@/lib/db";
import SocialAction from "@/models/SocialAction";
import User from "@/models/User";

// Getting players likes and viewers



export async function getActivePlayers(userId?: string){

    try {
         await dbConnect();

        //  Fetch Users
         const query = userId   ? { _id: { $ne: userId } } : {};

  const realUsers = await User.find(query)
    .select(
      "name age photo voiceIntro statusBadge district bio state city country"
    )
    .sort({ lastActive: -1 })
    .limit(12)
    .lean();

  let likedIds: string[] = [];
  let receivedLikesCount = 0;
  let recentViewers: any[] = [];

  // 2️⃣ If logged in → fetch social data
  if (userId && userId !== "null") {
    const [likes, likesCount, views] = await Promise.all([
      SocialAction.find({ senderId: userId, type: "LIKE" })
        .select("receiverId")
        .lean(),

      SocialAction.countDocuments({
        receiverId: userId,
        type: "LIKE",
      }),

      SocialAction.find({
        receiverId: userId,
        type: "VIEW",
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("senderId", "name photo")
        .lean(),
    ]);

    likedIds = likes.map((l: any) => l.receiverId.toString());
    receivedLikesCount = likesCount;

    recentViewers = views
      .map((v: any) => ({
        id: v.senderId?._id?.toString(),
        name: v.senderId?.name,
        img:
          v.senderId?.photo ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.senderId?.name}`,
      }))
      .filter((v) => v.id);
  }

  // 3️⃣ Format users
 const formattedUsers = realUsers.map((u: any) => ({
  id: u._id.toString(), // ✅ only send string
  name: u.name,
  age: u.age,
  photo: u.photo || null,
  voiceIntro: u.voiceIntro || null,
  statusBadge: u.statusBadge || null,
  district: u.district || null,
  bio: u.bio || null,
  state: u.state || null,
  city: u.city || null,
  country: u.country || null,
  img:
    u.photo ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`,
}));

  return {
    users: formattedUsers,
    likedIds,
    receivedLikesCount,
    recentViewers,
  };


        
    } catch (error) {
        console.error("❌ [SERVER ACTION] Failed to fetch players:", error);
   return {
  users: [],
  likedIds: [],
  receivedLikesCount: 0,
  recentViewers: [],
};
        
    }
}