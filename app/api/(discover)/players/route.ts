// import { NextResponse } from "next/server";
// import User from "@/models/User";
// import SocialAction from "@/models/SocialAction";
// import { dbConnect } from "@/lib/db";

// export async function GET(request: Request) {
//   const start = Date.now();
//   try {
//     await dbConnect();
//     const { searchParams } = new URL(request.url);
//     const userId = searchParams.get("userId");

//     // 1. Fetch main player list
//     const query = userId ? { _id: { $ne: userId } } : {};
//     const realUsers = await User.find(query)
//       .select(
//         "name age photo voiceIntro statusBadge district bio state city country",
//       )
//       .sort({ lastActive: -1 })
//       .limit(12)
//       .lean();

//     let likedIds: string[] = [];
//     let receivedLikesCount = 0;
//     let recentViewers: any[] = [];

//     // 2. Fetch specific data for the logged-in user
//     if (userId && userId !== "null" && userId !== "") {
//       const [likes, likesCount, views] = await Promise.all([
//         SocialAction.find({ senderId: userId, type: "LIKE" })
//           .select("receiverId")
//           .lean(),
//         SocialAction.countDocuments({ receiverId: userId, type: "LIKE" }),
//         // Fetch people who viewed YOU
//         SocialAction.find({ receiverId: userId, type: "VIEW" })
//           .sort({ createdAt: -1 })
//           .limit(5)
//           .populate("senderId", "name photo")
//           .lean(),
//       ]);

//       likedIds = likes.map((l: any) => l.receiverId.toString());
//       receivedLikesCount = likesCount;
//       recentViewers = views
//         .map((v: any) => ({
//           id: v.senderId?._id,
//           name: v.senderId?.name,
//           img:
//             v.senderId?.photo ||
//             `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.senderId?.name}`,
//         }))
//         .filter((v) => v.id);
//     }

//     const formattedUsers = realUsers.map((u: any) => ({
//       ...u,
//       id: u._id.toString(),
//       img:
//         u.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`,
//     }));

//     return NextResponse.json({
//       users: formattedUsers,
//       likedIds,
//       receivedLikesCount,
//       recentViewers,
//     });
//   } catch (error) {
//     return NextResponse.json({ users: [] }, { status: 500 });
//   }
// }
