// utils/mockData.js

// الصور الرمزية (باستخدم pravatar للتناسق)
export const AVATARS = {
  user1: "https://i.pravatar.cc/150?img=1",
  user2: "https://i.pravatar.cc/150?img=2",
  user3: "https://i.pravatar.cc/150?img=3",
  user4: "https://i.pravatar.cc/150?img=4",
  user5: "https://i.pravatar.cc/150?img=5",
  user6: "https://i.pravatar.cc/150?img=6",
  user7: "https://i.pravatar.cc/150?img=7",
  user8: "https://i.pravatar.cc/150?img=8",
  user9: "https://i.pravatar.cc/150?img=9",
  user10: "https://i.pravatar.cc/150?img=10",
  user11: "https://i.pravatar.cc/150?img=11",
  user12: "https://i.pravatar.cc/150?img=12",
  user13: "https://i.pravatar.cc/150?img=13",
  user14: "https://i.pravatar.cc/150?img=14",
  user15: "https://i.pravatar.cc/150?img=15",
  user16: "https://i.pravatar.cc/150?img=16",
  user17: "https://i.pravatar.cc/150?img=17",
  user18: "https://i.pravatar.cc/150?img=18",
  user19: "https://i.pravatar.cc/150?img=19",
  user20: "https://i.pravatar.cc/150?img=20",
  user21: "https://i.pravatar.cc/150?img=21",
  user22: "https://i.pravatar.cc/150?img=22",
  user23: "https://i.pravatar.cc/150?img=23",
  user24: "https://i.pravatar.cc/150?img=24",
  user25: "https://i.pravatar.cc/150?img=25",
  user26: "https://i.pravatar.cc/150?img=26",
  user27: "https://i.pravatar.cc/150?img=27",
  user28: "https://i.pravatar.cc/150?img=28",
  user29: "https://i.pravatar.cc/150?img=29",
  user30: "https://i.pravatar.cc/150?img=30",
  user31: "https://i.pravatar.cc/150?img=31",
  user32: "https://i.pravatar.cc/150?img=32",
  user33: "https://i.pravatar.cc/150?img=33",
  user34: "https://i.pravatar.cc/150?img=34",
  user35: "https://i.pravatar.cc/150?img=35",
  user36: "https://i.pravatar.cc/150?img=36",
  user37: "https://i.pravatar.cc/150?img=37",
  user38: "https://i.pravatar.cc/150?img=38",
  user39: "https://i.pravatar.cc/150?img=39",
  user40: "https://i.pravatar.cc/150?img=40",
  user41: "https://i.pravatar.cc/150?img=41",
  user42: "https://i.pravatar.cc/150?img=42",
  user43: "https://i.pravatar.cc/150?img=43",
  user44: "https://i.pravatar.cc/150?img=44",
  user45: "https://i.pravatar.cc/150?img=45",
  user46: "https://i.pravatar.cc/150?img=46",
  user47: "https://i.pravatar.cc/150?img=47",
  user48: "https://i.pravatar.cc/150?img=48",
  user49: "https://i.pravatar.cc/150?img=49",
  user50: "https://i.pravatar.cc/150?img=50"
};

// صور للمنشورات
export const POST_IMAGES = [
  "https://images.unsplash.com/photo-1505693314120-0d443867891c", // غرفة نوم
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36", // مكتب
  "https://images.unsplash.com/photo-1589939705384-5185137a7f0f", // دهانات
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e", // سباكة
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b3", // كهرباء
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc", // أثاث
  "https://images.unsplash.com/photo-1539008835657-9e8e9680c956", // فستان
  "https://images.unsplash.com/photo-1509391366360-2e959784a4a0", // طاقة شمسية
  "https://images.unsplash.com/photo-1561070791-2526d30994b5", // تصميم
  "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7", // عام
  "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb", // عام 2
  "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0", // عام 3
  "https://images.unsplash.com/photo-1611162617263-4ec3060a058e", // عام 4
  "https://images.unsplash.com/photo-1611162618752-3b3f9c8d1a2b", // عام 5
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809", // خلفية
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136", // بناء
  "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa", // نجارة
  "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e", // حدادة
  "https://images.unsplash.com/photo-1581783898377-1c85bf937427", // دهان
  "https://images.unsplash.com/photo-1581783345688-f5d93d88b1b7" // سباكة
];

// بيانات المستخدمين
export const USERS = [
  {
    id: 1,
    name: "أحمد محمد",
    username: "ahmed_m",
    avatar: AVATARS.user1,
    cover: POST_IMAGES[14],
    bio: "مقاول عام | تشطيبات فاخرة | خبرة 15 سنة في مجال البناء والتشييد",
    followers: 5234,
    following: 567,
    posts: 189,
    rating: 4.9,
    completedJobs: 128,
    isOnline: true,
    role: "artisan",
    craft: "مقاول عام",
    workStatus: "working",
    location: "الجزائر العاصمة",
    phone: "+213 555 123456",
    email: "ahmed.m@example.com",
    website: "www.ahmed-construction.dz",
    joinedDate: "2020-03-15"
  },
  {
    id: 2,
    name: "سارة أحمد",
    username: "sara_a",
    avatar: AVATARS.user2,
    cover: POST_IMAGES[9],
    bio: "مصممة ديكور داخلي | متخصصة في التصميم العصري والكلاسيكي",
    followers: 3890,
    following: 423,
    posts: 234,
    rating: 4.8,
    completedJobs: 95,
    isOnline: true,
    role: "worker",
    craft: "مصممة ديكور",
    workStatus: "working",
    currentProject: "تجهيز معرض سيارات",
    location: "الجزائر العاصمة",
    timeLeft: "3 أيام",
    phone: "+213 555 234567",
    email: "sara.a@example.com",
    instagram: "@sara_design",
    joinedDate: "2021-06-20"
  },
  {
    id: 3,
    name: "محمد علي",
    username: "mohamed_ali",
    avatar: AVATARS.user3,
    cover: POST_IMAGES[6],
    bio: "نجار ماهر | أثاث كلاسيكي وعصري | تنفيذ حسب الطلب",
    followers: 6341,
    following: 312,
    posts: 456,
    rating: 4.9,
    completedJobs: 267,
    isOnline: false,
    role: "artisan",
    craft: "نجار",
    workStatus: "available",
    location: "وهران",
    rate: "5000 دج/يوم",
    phone: "+213 555 345678",
    email: "mohamed.ali@example.com",
    joinedDate: "2019-11-10"
  },
  {
    id: 4,
    name: "فاطمة الزهراء",
    username: "fatima_z",
    avatar: AVATARS.user4,
    cover: POST_IMAGES[7],
    bio: "خياطة وتفصيل أزياء راقية | فساتين أفراح وسهرات",
    followers: 8567,
    following: 289,
    posts: 678,
    rating: 4.9,
    completedJobs: 432,
    isOnline: true,
    role: "artisan",
    craft: "خياطة",
    workStatus: "working",
    currentProject: "تفصيل فساتين أفراح",
    location: "قسنطينة",
    timeLeft: "أسبوع",
    phone: "+213 555 456789",
    email: "fatima.z@example.com",
    joinedDate: "2020-08-05"
  },
  {
    id: 5,
    name: "عمر حسن",
    username: "omar_h",
    avatar: AVATARS.user5,
    cover: POST_IMAGES[4],
    bio: "كهربائي محترف | تركيب أنظمة ذكية ولوحات توزيع",
    followers: 4234,
    following: 456,
    posts: 345,
    rating: 4.7,
    completedJobs: 189,
    isOnline: false,
    role: "worker",
    craft: "كهربائي",
    workStatus: "offline",
    location: "بجاية",
    lastSeen: "منذ ساعتين",
    phone: "+213 555 567890",
    email: "omar.h@example.com",
    joinedDate: "2021-02-18"
  },
  {
    id: 6,
    name: "نورا عبدالله",
    username: "nora_a",
    avatar: AVATARS.user6,
    cover: POST_IMAGES[2],
    bio: "دهانة محترفة | ديكورات ودهانات زخرفية عصرية",
    followers: 5678,
    following: 345,
    posts: 234,
    rating: 4.8,
    completedJobs: 156,
    isOnline: true,
    role: "artisan",
    craft: "دهان",
    workStatus: "working",
    currentProject: "دهان عمارة سكنية",
    location: "البليدة",
    timeLeft: "5 أيام",
    phone: "+213 555 678901",
    email: "nora.a@example.com",
    joinedDate: "2021-09-12"
  },
  {
    id: 7,
    name: "خالد بن علي",
    username: "khaled_b",
    avatar: AVATARS.user7,
    cover: POST_IMAGES[3],
    bio: "سباك عام | تركيب أنظمة تدفئة مركزية وطاقة شمسية",
    followers: 3456,
    following: 234,
    posts: 189,
    rating: 4.8,
    completedJobs: 234,
    isOnline: true,
    role: "worker",
    craft: "سباك",
    workStatus: "available",
    location: "عنابة",
    rate: "4000 دج/يوم",
    phone: "+213 555 789012",
    email: "khaled.b@example.com",
    joinedDate: "2020-12-03"
  },
  {
    id: 8,
    name: "ليلى محمد",
    username: "laila_m",
    avatar: AVATARS.user8,
    cover: POST_IMAGES[8],
    bio: "مهندسة معمارية | تصاميم عصرية ومستدامة",
    followers: 7890,
    following: 567,
    posts: 456,
    rating: 4.9,
    completedJobs: 89,
    isOnline: true,
    role: "artisan",
    craft: "مهندسة معمارية",
    workStatus: "working",
    currentProject: "تصميم فيلا سكنية",
    location: "الجزائر العاصمة",
    timeLeft: "أسبوعين",
    phone: "+213 555 890123",
    email: "laila.m@example.com",
    joinedDate: "2022-01-15"
  },
  {
    id: 9,
    name: "يوسف عبدالله",
    username: "youssef_a",
    avatar: AVATARS.user9,
    cover: POST_IMAGES[15],
    bio: "بناء ومقاولات | تشطيبات خارجية وداخلية",
    followers: 4567,
    following: 345,
    posts: 234,
    rating: 4.7,
    completedJobs: 178,
    isOnline: false,
    role: "worker",
    craft: "بناء",
    workStatus: "offline",
    location: "تيارت",
    lastSeen: "منذ 5 ساعات",
    phone: "+213 555 901234",
    email: "youssef.a@example.com",
    joinedDate: "2021-07-22"
  },
  {
    id: 10,
    name: "هدى كريم",
    username: "houda_k",
    avatar: AVATARS.user10,
    cover: POST_IMAGES[16],
    bio: "فنانة تشكيلية | لوحات جدارية وديكورات فنية",
    followers: 6789,
    following: 456,
    posts: 567,
    rating: 4.9,
    completedJobs: 145,
    isOnline: true,
    role: "artisan",
    craft: "رسامة",
    workStatus: "working",
    currentProject: "رسومات جدارية لمدرسة",
    location: "سطيف",
    timeLeft: "4 أيام",
    phone: "+213 555 012345",
    email: "houda.k@example.com",
    joinedDate: "2022-03-08"
  },
  {
    id: 11,
    name: "رضا محسن",
    username: "reda_m",
    avatar: AVATARS.user11,
    cover: POST_IMAGES[17],
    bio: "حداد متخصص | أبواب وشبابيك حديد مشغول",
    followers: 3456,
    following: 234,
    posts: 178,
    rating: 4.7,
    completedJobs: 267,
    isOnline: true,
    role: "worker",
    craft: "حداد",
    workStatus: "available",
    location: "الشلف",
    rate: "4500 دج/يوم",
    phone: "+213 555 123450",
    email: "reda.m@example.com",
    joinedDate: "2020-05-30"
  },
  {
    id: 12,
    name: "سمية نور",
    username: "soumia_n",
    avatar: AVATARS.user12,
    cover: POST_IMAGES[18],
    bio: "خبيرة تجميل | مكياج وتسريحات للمناسبات",
    followers: 9876,
    following: 678,
    posts: 789,
    rating: 4.9,
    completedJobs: 567,
    isOnline: true,
    role: "worker",
    craft: "خبيرة تجميل",
    workStatus: "working",
    currentProject: "تجهيز عروس",
    location: "بسكرة",
    timeLeft: "يومين",
    phone: "+213 555 234501",
    email: "soumia.n@example.com",
    joinedDate: "2021-11-11"
  },
  {
    id: 13,
    name: "إبراهيم صالح",
    username: "ibrahim_s",
    avatar: AVATARS.user13,
    cover: POST_IMAGES[19],
    bio: "فني تبريد وتكييف | صيانة وتركيب جميع الأنظمة",
    followers: 2345,
    following: 123,
    posts: 134,
    rating: 4.8,
    completedJobs: 345,
    isOnline: false,
    role: "worker",
    craft: "فني تكييف",
    workStatus: "offline",
    location: "المسيلة",
    lastSeen: "منذ يوم",
    phone: "+213 555 345012",
    email: "ibrahim.s@example.com",
    joinedDate: "2020-09-17"
  },
  {
    id: 14,
    name: "منال عادل",
    username: "manal_a",
    avatar: AVATARS.user14,
    cover: POST_IMAGES[0],
    bio: "مصممة أزياء | تصاميم عصرية وكلاسيكية",
    followers: 5678,
    following: 456,
    posts: 345,
    rating: 4.8,
    completedJobs: 234,
    isOnline: true,
    role: "artisan",
    craft: "مصممة أزياء",
    workStatus: "working",
    currentProject: "مجموعة خريف وشتاء",
    location: "تلمسان",
    timeLeft: "3 أسابيع",
    phone: "+213 555 456023",
    email: "manal.a@example.com",
    joinedDate: "2022-02-14"
  },
  {
    id: 15,
    name: "كمال رابح",
    username: "kamal_r",
    avatar: AVATARS.user15,
    cover: POST_IMAGES[1],
    bio: "مبلط سيراميك ورخام | تشطيبات فاخرة",
    followers: 3456,
    following: 234,
    posts: 189,
    rating: 4.7,
    completedJobs: 278,
    isOnline: true,
    role: "worker",
    craft: "مبلط",
    workStatus: "available",
    location: "سطيف",
    rate: "4000 دج/يوم",
    phone: "+213 555 567034",
    email: "kamal.r@example.com",
    joinedDate: "2020-07-19"
  }
];

// الحرف والصناعات
export const CRAFTS = [
  "مقاول عام",
  "مهندس معماري",
  "نجار",
  "حداد",
  "سباك",
  "كهربائي",
  "دهان",
  "مبلط",
  "جباص",
  "عامل بناء",
  "مصمم ديكور",
  "مصمم أزياء",
  "خياط",
  "خبيرة تجميل",
  "فني تكييف",
  "فني تبريد",
  "خزاف",
  "نقاش",
  "مرمرجي",
  "زجاجي",
  "ألمنيوم",
  "نجار أثاث",
  "مركب مطابخ",
  "تركيب باركيه",
  "عزل حراري",
  "عزل مائي",
  "تنظيف واجهات",
  "صيانة عامة",
  "حدائق وتنسيق",
  "ري آلي"
];

// الولايات الجزائرية
export const ALGERIAN_CITIES = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار",
  "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر",
  "الجلفة", "جيجل", "سطيف", "سعيدة", "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة",
  "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة", "وهران", "البيض",
  "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي",
  "خنشلة", "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت",
  "غرداية", "غليزان", "المغير", "المنيعة", "أولاد جلال", "بني عباس", "عين صالح",
  "عين قزام", "تقرت", "جانت", "تيميمون"
];

// توليد منشورات عشوائية
export const generatePosts = (count = 50) => {
  const posts = [];
  
  for (let i = 1; i <= count; i++) {
    const user = USERS[Math.floor(Math.random() * USERS.length)];
    const randomImage = POST_IMAGES[Math.floor(Math.random() * POST_IMAGES.length)];
    const randomLikes = Math.floor(Math.random() * 1000) + 50;
    const randomComments = Math.floor(Math.random() * 200) + 10;
    const randomShares = Math.floor(Math.random() * 100) + 5;
    const isLiked = Math.random() > 0.7;
    const isSaved = Math.random() > 0.8;
    
    const hoursAgo = Math.floor(Math.random() * 72) + 1;
    const timestamp = hoursAgo < 24 
      ? `منذ ${hoursAgo} ساعة` 
      : `منذ ${Math.floor(hoursAgo / 24)} يوم`;
    
    const contents = [
      "أنهيت اليوم مشروع جديد، سعيد بالنتيجة! ✨",
      "عمل جديد قيد التنفيذ، تفاصيل قريباً 🔨",
      "ورشة عمل مفتوحة للاستشارات المجانية اليوم 💡",
      "تشطيبات فاخرة لمنزل عصري 🏠",
      "تصميم حسب الطلب، بأعلى جودة 🎨",
      "صيانة وتجديد المنازل بأفضل الأسعار 🔧",
      "نصائح وحيل للعناية بالأثاث الخشبي 🌳",
      "معرض أعمالي متاح للزيارة الآن 🖼️",
      "طلب خاص لعميل مميز، شكراً لثقتكم 🙏",
      "جديد الأعمال: ديكورات عصرية بلمسة كلاسيكية ✨"
    ];
    
    const content = contents[Math.floor(Math.random() * contents.length)];
    
    const tags = [];
    const possibleTags = ["تصميم", "ديكور", "بناء", "تشطيبات", "أثاث", "عصري", "كلاسيكي", "فاخر", "حرفي", "جزائري"];
    const numTags = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numTags; j++) {
      const tag = possibleTags[Math.floor(Math.random() * possibleTags.length)];
      if (!tags.includes(tag)) tags.push(tag);
    }
    
    posts.push({
      id: i,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userRole: user.role,
      userCraft: user.craft,
      content: content,
      image: randomImage,
      likes: randomLikes,
      comments: randomComments,
      shares: randomShares,
      timestamp: timestamp,
      isLiked: isLiked,
      isSaved: isSaved,
      link: Math.random() > 0.5 ? `https://example.com/portfolio/${user.username}` : null,
      linkTitle: Math.random() > 0.5 ? `معرض أعمال ${user.name}` : null,
      tags: tags
    });
  }
  
  // ترتيب حسب التاريخ (الأحدث أولاً)
  return posts.sort((a, b) => {
    const hourA = parseInt(a.timestamp.split(' ')[1]) || 0;
    const hourB = parseInt(b.timestamp.split(' ')[1]) || 0;
    return hourA - hourB;
  });
};

// المنشورات
export const POSTS = generatePosts(50);

// حالة العمل للمتابعين
export const WORK_STATUS = USERS.map(user => ({
  id: user.id,
  name: user.name,
  username: user.username,
  avatar: user.avatar,
  role: user.role,
  craft: user.craft,
  workStatus: user.workStatus,
  currentProject: user.currentProject || (user.workStatus === 'working' ? `مشروع ${user.craft}` : null),
  location: user.location,
  timeLeft: user.timeLeft,
  lastSeen: user.lastSeen,
  rate: user.rate
})).filter(user => user.id !== 1); // نستبعد المستخدم الحالي

// الإشعارات
export const NOTIFICATIONS = [
  {
    id: 1,
    type: "like",
    userId: 3,
    userName: "محمد علي",
    userAvatar: AVATARS.user3,
    content: "أعجب بمنشورك",
    postId: 5,
    timestamp: "منذ 5 دقائق",
    read: false
  },
  {
    id: 2,
    type: "comment",
    userId: 4,
    userName: "فاطمة الزهراء",
    userAvatar: AVATARS.user4,
    content: "علق على منشورك: 'عمل رائع! نتمنى لك التوفيق'",
    postId: 8,
    timestamp: "منذ 15 دقيقة",
    read: false
  },
  {
    id: 3,
    type: "follow",
    userId: 5,
    userName: "عمر حسن",
    userAvatar: AVATARS.user5,
    content: "بدأ بمتابعتك",
    timestamp: "منذ ساعة",
    read: true
  },
  {
    id: 4,
    type: "request",
    userId: 6,
    userName: "نورا عبدالله",
    userAvatar: AVATARS.user6,
    content: "أرسل لك طلب خدمة: تصميم داخلي للصالون",
    timestamp: "منذ 3 ساعات",
    read: false,
    requestId: 101
  },
  {
    id: 5,
    type: "share",
    userId: 7,
    userName: "خالد بن علي",
    userAvatar: AVATARS.user7,
    content: "شارك منشورك",
    postId: 12,
    timestamp: "منذ 5 ساعات",
    read: true
  },
  {
    id: 6,
    type: "mention",
    userId: 2,
    userName: "سارة أحمد",
    userAvatar: AVATARS.user2,
    content: "ذكرك في تعليق",
    postId: 15,
    timestamp: "منذ 8 ساعات",
    read: false
  },
  {
    id: 7,
    type: "like",
    userId: 8,
    userName: "ليلى محمد",
    userAvatar: AVATARS.user8,
    content: "أعجب بمنشورك",
    postId: 3,
    timestamp: "منذ 10 ساعات",
    read: true
  },
  {
    id: 8,
    type: "request",
    userId: 9,
    userName: "يوسف عبدالله",
    userAvatar: AVATARS.user9,
    content: "أرسل لك طلب خدمة: تركيب مطبخ جديد",
    timestamp: "منذ يوم",
    read: false,
    requestId: 102
  }
];

// الرسائل
export const MESSAGES = [
  {
    id: 1,
    userId: 2,
    userName: "سارة أحمد",
    userAvatar: AVATARS.user2,
    lastMessage: "مرحباً، هل يمكنك مساعدتي في تصميم غرفة المعيشة؟",
    timestamp: "منذ 10 دقائق",
    unread: 2,
    isOnline: true,
    messages: [
      { id: 101, senderId: 2, text: "مرحباً، كيف حالك؟", time: "10:30", read: true },
      { id: 102, senderId: 1, text: "وعليكم السلام، بخير الحمد لله", time: "10:32", read: true },
      { id: 103, senderId: 2, text: "هل يمكنك مساعدتي في تصميم غرفة المعيشة؟", time: "10:35", read: true },
      { id: 104, senderId: 2, text: "عندي مساحة 5*6 وأريد تصميماً عصرياً", time: "10:36", read: false }
    ]
  },
  {
    id: 2,
    userId: 3,
    userName: "محمد علي",
    userAvatar: AVATARS.user3,
    lastMessage: "تم استلام طلبك، سأتواصل معك قريباً",
    timestamp: "منذ ساعة",
    unread: 0,
    isOnline: false,
    messages: [
      { id: 201, senderId: 1, text: "السلام عليكم، أريد استشارة بخصوص أثاث غرفة نوم", time: "09:15", read: true },
      { id: 202, senderId: 3, text: "وعليكم السلام، تفضل أخي", time: "09:20", read: true },
      { id: 203, senderId: 1, text: "عندي غرفة 4*4، ما رأيك بالتصميم المناسب؟", time: "09:22", read: true },
      { id: 204, senderId: 3, text: "تم استلام طلبك، سأتواصل معك قريباً", time: "09:30", read: true }
    ]
  },
  {
    id: 3,
    userId: 4,
    userName: "فاطمة الزهراء",
    userAvatar: AVATARS.user4,
    lastMessage: "شكراً جزيلاً على مساعدتك",
    timestamp: "منذ 3 ساعات",
    unread: 1,
    isOnline: true,
    messages: [
      { id: 301, senderId: 4, text: "السلام عليكم، أحتاج فستان سهرة", time: "14:20", read: true },
      { id: 302, senderId: 1, text: "وعليكم السلام، تفضلي", time: "14:25", read: true },
      { id: 303, senderId: 4, text: "ما هي التصاميم المتوفرة حالياً؟", time: "14:28", read: true },
      { id: 304, senderId: 1, text: "سأرسل لك كتالوج الأعمال", time: "14:30", read: true },
      { id: 305, senderId: 4, text: "شكراً جزيلاً على مساعدتك", time: "14:45", read: false }
    ]
  },
  {
    id: 4,
    userId: 5,
    userName: "عمر حسن",
    userAvatar: AVATARS.user5,
    lastMessage: "متى يمكنك المجيء لمعاينة الشقة؟",
    timestamp: "منذ 5 ساعات",
    unread: 0,
    isOnline: false,
    messages: [
      { id: 401, senderId: 5, text: "السلام عليكم، أحتاج كهربائي لشقة جديدة", time: "11:00", read: true },
      { id: 402, senderId: 1, text: "وعليكم السلام، تفضل", time: "11:05", read: true },
      { id: 403, senderId: 5, text: "متى يمكنك المجيء لمعاينة الشقة؟", time: "11:10", read: true }
    ]
  },
  {
    id: 5,
    userId: 8,
    userName: "ليلى محمد",
    userAvatar: AVATARS.user8,
    lastMessage: "أحتاج استشارتك في مشروع فيلا",
    timestamp: "منذ يوم",
    unread: 0,
    isOnline: true,
    messages: [
      { id: 501, senderId: 8, text: "مرحباً مهندس، أحتاج استشارتك في مشروع فيلا", time: "16:30", read: true },
      { id: 502, senderId: 1, text: "مرحباً، تفضلي", time: "16:35", read: true },
      { id: 503, senderId: 8, text: "عندي أرض 200 متر، ممكن تصميم عصري؟", time: "16:40", read: true },
      { id: 504, senderId: 1, text: "طبعاً، أحتاج بعض التفاصيل", time: "16:45", read: true }
    ]
  },
  {
    id: 6,
    userId: 10,
    userName: "هدى كريم",
    userAvatar: AVATARS.user10,
    lastMessage: "أرسلت لك صور اللوحات الجدارية",
    timestamp: "منذ يومين",
    unread: 0,
    isOnline: true,
    messages: [
      { id: 601, senderId: 10, text: "مرحباً، أرسلت لك صور اللوحات الجدارية", time: "13:20", read: true },
      { id: 602, senderId: 1, text: "استلمتها، أعمال رائعة", time: "13:30", read: true }
    ]
  }
];

// طلبات الخدمة
export const REQUESTS = [
  {
    id: 101,
    userId: 6,
    userName: "نورا عبدالله",
    userAvatar: AVATARS.user6,
    title: "تصميم داخلي للصالون",
    description: "أحتاج تصميم عصري لصالون بمساحة 30 متر مربع. أريد ألوان فاتحة مع لمسات عصرية.",
    status: "pending", // pending, accepted, rejected, completed
    createdAt: "منذ 3 ساعات",
    budget: "50000 دج",
    deadline: "أسبوعين",
    location: "البليدة",
    attachments: [POST_IMAGES[0], POST_IMAGES[1]]
  },
  {
    id: 102,
    userId: 9,
    userName: "يوسف عبدالله",
    userAvatar: AVATARS.user9,
    title: "تركيب مطبخ جديد",
    description: "أحتاج نجار لتركيب مطبخ جديد في منزلي. المطبخ جاهز ويحتاج تركيب فقط.",
    status: "pending",
    createdAt: "منذ يوم",
    budget: "30000 دج",
    deadline: "3 أيام",
    location: "تيارت",
    attachments: [POST_IMAGES[6]]
  },
  {
    id: 103,
    userId: 12,
    userName: "سمية نور",
    userAvatar: AVATARS.user12,
    title: "مكياج زفاف",
    description: "أحتاج خبيرة تجميل لعروس مع 5 سيدات. الموعد بعد شهر.",
    status: "accepted",
    createdAt: "منذ 3 أيام",
    budget: "80000 دج",
    deadline: "شهر",
    location: "بسكرة"
  },
  {
    id: 104,
    userId: 14,
    userName: "منال عادل",
    userAvatar: AVATARS.user14,
    title: "تصميم فستان سهرة",
    description: "أريد فستان سهرة بتصميم عصري ومميز للمناسبات.",
    status: "completed",
    createdAt: "منذ أسبوع",
    budget: "35000 دج",
    deadline: "أسبوع",
    location: "تلمسان",
    attachments: [POST_IMAGES[7]]
  },
  {
    id: 105,
    userId: 11,
    userName: "رضا محسن",
    userAvatar: AVATARS.user11,
    title: "أبواب وشبابيك حديد",
    description: "أحتاج حداد لعمل أبواب وشبابيك لعمارة سكنية. 5 أبواب و 10 شبابيك.",
    status: "rejected",
    createdAt: "منذ 5 أيام",
    budget: "150000 دج",
    deadline: "شهر",
    location: "الشلف"
  },
  {
    id: 106,
    userId: 13,
    userName: "إبراهيم صالح",
    userAvatar: AVATARS.user13,
    title: "صيانة مكيفات",
    description: "صيانة 4 مكيفات سبليت في فيلا. تنظيف وغاز.",
    status: "pending",
    createdAt: "منذ 6 ساعات",
    budget: "20000 دج",
    deadline: "يومين",
    location: "المسيلة"
  }
];

// اقتراحات المستخدمين (لصفحة Suggestions)
export const SUGGESTIONS = [
  {
    id: 101,
    user: USERS[2],
    commonFollowers: [USERS[3], USERS[4], USERS[5]],
    matchPercentage: 85,
    reason: "يعمل في نفس المجال"
  },
  {
    id: 102,
    user: USERS[3],
    commonFollowers: [USERS[2], USERS[6], USERS[7]],
    matchPercentage: 72,
    reason: "معجب بصفحات مشابهة"
  },
  {
    id: 103,
    user: USERS[4],
    commonFollowers: [USERS[5], USERS[8], USERS[9], USERS[10]],
    matchPercentage: 68,
    reason: "من نفس المدينة"
  },
  {
    id: 104,
    user: USERS[5],
    commonFollowers: [USERS[2], USERS[6]],
    matchPercentage: 45,
    reason: "مقترح بناءً على متابعاتك"
  },
  {
    id: 105,
    user: USERS[6],
    commonFollowers: [USERS[3], USERS[7], USERS[8]],
    matchPercentage: 78,
    reason: "حرفي متميز في منطقتك"
  },
  {
    id: 106,
    user: USERS[7],
    commonFollowers: [USERS[2], USERS[4], USERS[9]],
    matchPercentage: 62,
    reason: "نشط في نفس المجالات"
  },
  {
    id: 107,
    user: USERS[8],
    commonFollowers: [USERS[3], USERS[5], USERS[10]],
    matchPercentage: 81,
    reason: "معجبون مشتركون"
  },
  {
    id: 108,
    user: USERS[9],
    commonFollowers: [USERS[2], USERS[6], USERS[7]],
    matchPercentage: 55,
    reason: "مقترح شائع"
  },
  {
    id: 109,
    user: USERS[10],
    commonFollowers: [USERS[4], USERS[8], USERS[11]],
    matchPercentage: 73,
    reason: "حرفي معتمد"
  },
  {
    id: 110,
    user: USERS[11],
    commonFollowers: [USERS[3], USERS[5], USERS[12]],
    matchPercentage: 69,
    reason: "يشاركك نفس الاهتمامات"
  },
  {
    id: 111,
    user: USERS[12],
    commonFollowers: [USERS[2], USERS[7], USERS[13]],
    matchPercentage: 77,
    reason: "مقترح من فريق HandyLink"
  },
  {
    id: 112,
    user: USERS[13],
    commonFollowers: [USERS[4], USERS[6], USERS[14]],
    matchPercentage: 58,
    reason: "حرفي مميز"
  },
  {
    id: 113,
    user: USERS[14],
    commonFollowers: [USERS[3], USERS[8], USERS[15]],
    matchPercentage: 82,
    reason: "نسبة تطابق عالية"
  },
  {
    id: 114,
    user: USERS[15],
    commonFollowers: [USERS[5], USERS[9], USERS[2]],
    matchPercentage: 64,
    reason: "من نفس المدينة"
  }
];

// الإعدادات
export const SETTINGS = {
  profile: {
    name: USERS[0].name,
    username: USERS[0].username,
    bio: USERS[0].bio,
    email: USERS[0].email,
    phone: USERS[0].phone,
    location: USERS[0].location,
    website: USERS[0].website,
    avatar: USERS[0].avatar,
    cover: USERS[0].cover,
    craft: USERS[0].craft,
    role: USERS[0].role,
    workStatus: USERS[0].workStatus,
    dailyRate: USERS[0].rate || "5000 دج/يوم"
  },
  privacy: {
    profileVisibility: "public", // public, private, friends
    showOnlineStatus: true,
    showLastSeen: true,
    showWorkStatus: true,
    allowMessagesFrom: "everyone", // everyone, followers, nobody
    allowRequestsFrom: "everyone", // everyone, followers, nobody
    showEmail: false,
    showPhone: false
  },
  notifications: {
    likes: true,
    comments: true,
    follows: true,
    requests: true,
    messages: true,
    mentions: true,
    shares: true,
    emailNotifications: false,
    pushNotifications: true
  },
  appearance: {
    theme: "light", // light, dark, system
    language: "ar",
    fontSize: "medium", // small, medium, large
    reducedMotion: false
  },
  account: {
    emailVerified: true,
    phoneVerified: true,
    twoFactorEnabled: false,
    accountType: "professional", // personal, professional
    verifiedBadge: true,
    memberSince: USERS[0].joinedDate
  }
};