# د Portfolio کوډ پېژندلو ساده پښتو لارښود

دا فایل د دې لپاره دی چې ته هر وخت پوه شې کوم کار په کوم فایل کې کېږي.

## تر ټولو مهم فایلونه

| فایل                            | څه کار کوي؟                                                       |
| ------------------------------- | ----------------------------------------------------------------- |
| `src/main.jsx`                  | زموږ React اپلیکېشن پیلوي.                                        |
| `src/App.jsx`                   | ټاکي چې کوم URL کومه صفحه خلاصوي.                                 |
| `src/pages/Portfolio.jsx`       | اصلي ویب‌سایټ، Homepage او د پروژې تفصیلي صفحه جوړوي.             |
| `src/components/SkillIcon.jsx`  | د React، JavaScript او نورو Skills لوګوګانې ټاکي.                 |
| `src/components/SiteChrome.jsx` | Navbar، Footer او د Dark/Light Mode بټن جوړوي.                    |
| `src/pages/Admin.jsx`           | Admin Login، Dashboard، د معلوماتو Save/Delete او Moderation کوي. |
| `src/config/adminContent.js`    | د Admin فورم ټول فیلډونه او د Menu برخې پکې دي.                   |
| `src/lib/supabase.js`           | React د Supabase له پروژې سره نښلوي.                              |
| `src/lib/api.js`                | Database ته معلومات لېږي، ترې اخلي او عکسونه Upload کوي.          |
| `src/contexts/AuthContext.jsx`  | د Login، Logout او د Admin اجازې حالت ساتي.                       |
| `src/hooks/usePortfolio.js`     | د ویب‌سایټ خپاره شوي معلومات رااخلي.                              |
| `src/styles/index.css`          | رنګونه، شکلونه، عکس، Skills او Mobile ډیزاین کنټرولوي.            |

## درې عملي مثالونه

**۱. د Profile عکس اندازه او Rounded کول:**
`src/styles/index.css` خلاص کړه. د `11 PROFILE IMAGE OVERRIDES` عبارت Search کړه. هلته `.hero-profile-image` او `border-radius: 24px` پیدا کوې.

**۲. د Skills لوګو بدلول:**
`src/components/SkillIcon.jsx` خلاص کړه. د `skillIcons` په نوم Object شته. د نوي Skill لپاره باید Icon Import او همدلته یې نوم اضافه کړې.

**۳. د Admin فورم نوی فیلډ اضافه کول:**
`src/config/adminContent.js` خلاص کړه. په `definitions` کې د خپلې برخې فیلډ پیدا کړه. پام: که نوی فیلډ د Database په جدول کې نه وي، یوازې دلته اضافه کول کار نه کوي؛ Database کې یې هم باید جوړ کړې.

## د کوډ لوستل څنګه پیل کړې؟

`Ctrl + P` د فایل پیدا کولو لپاره، `Ctrl + F` د یوې کرښې پیدا کولو لپاره او `Ctrl + Shift + F` په ټولو فایلونو کې د لټون لپاره وکاروه.

کله چې د `useEffect` په څېر نوی Function ووینې، اول یې Comment ولوله، بیا وګوره کومې متغیرې کاروي او په پای کې یې نتیجه په Browser کې وازمایه.

## د پروژې د چالانولو کمانډونه

په VS Code Terminal کې د `package.json` د فولډر دننه:

```powershell
npm install
npm run dev
```

د Deploy نه مخکې:

```powershell
npm run build
```

## ډېر مهم امنیتي یادښت

ستا په رااستول شوي ZIP کې `.env.local` موجود و. ما دا فایل له پاکې نسخې ایستلی دی. په خپل کمپیوټر کې یې وساته؛ په GitHub کې یې مه اپلوډوه. د `VITE_` په برخه کې یوازې Public/Publishable Key استعمال کړه، هېڅکله د Supabase Service Role Secret یا Database Password مه ورکوې.

دا پروژه د Supabase Database معلومات نه انتقالوي. ستا مخکې ثبت شوي Projects او Skills په Supabase کې پاتې کېږي.
