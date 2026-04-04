import { createContext, useContext, useState } from "react";

const T = (a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p) => ({
  ambiance:a, animation:b, language:c, brightness:d, bgBlue:e, starDensity:f,
  twinkle:g, rotation:h, shootingStars:i, reset:j, nowPlaying:k, playlist:l,
  crossfade:m, tracks:n, shuffle:o, repeat:p,
});

const translations = {
  fr: T("Ambiance","Animation","Langue","Luminosité","Fond (noir → midnight)","Densité étoiles","Scintillement","Rotation","Étoiles filantes","Réinitialiser","En cours","Playlist","Fondu","pistes","Aléatoire","Répéter"),
  en: T("Ambiance","Animation","Language","Brightness","Background (black → midnight)","Star density","Twinkle","Rotation","Shooting stars","Reset","Now playing","Playlist","Crossfade","tracks","Shuffle","Repeat"),
  es: T("Ambiente","Animación","Idioma","Brillo","Fondo (negro → midnight)","Densidad estrellas","Centelleo","Rotación","Estrellas fugaces","Restablecer","Reproduciendo","Lista","Fundido","pistas","Aleatorio","Repetir"),
  pt: T("Ambiente","Animação","Idioma","Brilho","Fundo (preto → midnight)","Densidade estrelas","Cintilação","Rotação","Estrelas cadentes","Redefinir","Tocando agora","Playlist","Transição","faixas","Aleatório","Repetir"),
  it: T("Atmosfera","Animazione","Lingua","Luminosità","Sfondo (nero → midnight)","Densità stelle","Scintillio","Rotazione","Stelle cadenti","Ripristina","In riproduzione","Playlist","Dissolvenza","brani","Casuale","Ripeti"),
  de: T("Atmosphäre","Animation","Sprache","Helligkeit","Hintergrund (schwarz → midnight)","Sterndichte","Funkeln","Rotation","Sternschnuppen","Zurücksetzen","Wird gespielt","Playlist","Überblendung","Titel","Zufällig","Wiederholen"),
  ru: T("Атмосфера","Анимация","Язык","Яркость","Фон (чёрный → midnight)","Плотность звёзд","Мерцание","Вращение","Падающие звёзды","Сбросить","Сейчас играет","Плейлист","Переход","треков","Перемешать","Повтор"),
  zh: T("氛围","动画","语言","亮度","背景（黑色 → 午夜蓝）","星星密度","闪烁","旋转","流星","重置","正在播放","播放列表","淡入淡出","首曲目","随机","循环"),
  "zh-tw": T("氛圍","動畫","語言","亮度","背景（黑色 → 午夜藍）","星星密度","閃爍","旋轉","流星","重置","正在播放","播放列表","淡入淡出","首曲目","隨機","循環"),
  ja: T("雰囲気","アニメーション","言語","明るさ","背景（黒 → ミッドナイト）","星の密度","きらめき","回転","流れ星","リセット","再生中","プレイリスト","クロスフェード","曲","シャッフル","リピート"),
  ko: T("분위기","애니메이션","언어","밝기","배경 (검정 → 미드나잇)","별 밀도","반짝임","회전","별똥별","초기화","재생 중","재생목록","크로스페이드","곡","셔플","반복"),
  hi: T("माहौल","एनिमेशन","भाषा","चमक","पृष्ठभूमि (काला → मिडनाइट)","तारों का घनत्व","टिमटिमाहट","घूर्णन","टूटते तारे","रीसेट","अभी चल रहा है","प्लेलिस्ट","क्रॉसफ़ेड","ट्रैक","शफ़ल","दोहराएँ"),
  ar: T("أجواء","رسوم متحركة","اللغة","السطوع","الخلفية (أسود ← منتصف الليل)","كثافة النجوم","وميض","دوران","نجوم متساقطة","إعادة تعيين","يعمل الآن","قائمة التشغيل","تلاشي متقاطع","مقاطع","عشوائي","تكرار"),
  bn: T("পরিবেশ","অ্যানিমেশন","ভাষা","উজ্জ্বলতা","পটভূমি (কালো → মিডনাইট)","তারার ঘনত্ব","মিটমিট","ঘূর্ণন","উল্কা","রিসেট","এখন চলছে","প্লেলিস্ট","ক্রসফেড","ট্র্যাক","শাফেল","পুনরাবৃত্তি"),
  pa: T("ਮਾਹੌਲ","ਐਨੀਮੇਸ਼ਨ","ਭਾਸ਼ਾ","ਚਮਕ","ਪਿਛੋਕੜ (ਕਾਲਾ → ਮਿਡਨਾਈਟ)","ਤਾਰਿਆਂ ਦੀ ਘਣਤਾ","ਟਿਮਟਿਮਾਹਟ","ਘੁੰਮਣਾ","ਟੁੱਟਦੇ ਤਾਰੇ","ਰੀਸੈੱਟ","ਹੁਣ ਚੱਲ ਰਿਹਾ","ਪਲੇਲਿਸਟ","ਕ੍ਰਾਸਫੇਡ","ਟ੍ਰੈਕ","ਸ਼ਫਲ","ਦੁਹਰਾਓ"),
  ur: T("ماحول","اینیمیشن","زبان","چمک","پس منظر (سیاہ → مڈنائٹ)","ستاروں کی کثافت","ٹمٹماہٹ","گردش","ٹوٹتے تارے","ری سیٹ","ابھی چل رہا ہے","پلے لسٹ","کراس فیڈ","ٹریک","شفل","دہرائیں"),
  ta: T("சூழல்","அனிமேஷன்","மொழி","பிரகாசம்","பின்னணி (கருப்பு → நள்ளிரவு)","நட்சத்திர அடர்த்தி","மின்னல்","சுழற்சி","எரிநட்சத்திரம்","மீட்டமை","இப்போது இயங்குகிறது","பிளேலிஸ்ட்","குறுக்கு மங்கல்","தடங்கள்","கலக்கு","மீண்டும்"),
  te: T("వాతావరణం","యానిమేషన్","భాష","ప్రకాశం","నేపథ్యం (నలుపు → మిడ్‌నైట్)","నక్షత్ర సాంద్రత","మెరుపు","భ్రమణం","ఉల్క","రీసెట్","ఇప్పుడు ఆడుతోంది","ప్లేలిస్ట్","క్రాస్‌ఫేడ్","ట్రాక్‌లు","షఫుల్","రిపీట్"),
  mr: T("वातावरण","अॅनिमेशन","भाषा","चमक","पार्श्वभूमी (काळा → मिडनाइट)","ताऱ्यांची घनता","चमचमणे","फिरणे","उल्का","रीसेट","सध्या वाजत आहे","प्लेलिस्ट","क्रॉसफेड","ट्रॅक","शफल","पुन्हा"),
  th: T("บรรยากาศ","แอนิเมชัน","ภาษา","ความสว่าง","พื้นหลัง (ดำ → มิดไนท์)","ความหนาแน่นดาว","ระยิบระยับ","การหมุน","ดาวตก","รีเซ็ต","กำลังเล่น","เพลย์ลิสต์","ครอสเฟด","แทร็ก","สุ่ม","เล่นซ้ำ"),
  vi: T("Không khí","Hoạt ảnh","Ngôn ngữ","Độ sáng","Nền (đen → midnight)","Mật độ sao","Lấp lánh","Xoay","Sao băng","Đặt lại","Đang phát","Danh sách","Chuyển mờ","bài","Ngẫu nhiên","Lặp lại"),
  id: T("Suasana","Animasi","Bahasa","Kecerahan","Latar (hitam → midnight)","Kepadatan bintang","Kelip","Rotasi","Bintang jatuh","Atur ulang","Sedang diputar","Daftar putar","Crossfade","lagu","Acak","Ulangi"),
  ms: T("Suasana","Animasi","Bahasa","Kecerahan","Latar (hitam → midnight)","Ketumpatan bintang","Berkelip","Putaran","Bintang jatuh","Set semula","Sedang dimainkan","Senarai main","Crossfade","lagu","Rawak","Ulang"),
  tl: T("Kapaligiran","Animasyon","Wika","Liwanag","Background (itim → midnight)","Density ng bituin","Kumikislap","Pag-ikot","Bulalakaw","I-reset","Nagpe-play","Playlist","Crossfade","kanta","Shuffle","Ulitin"),
  tr: T("Ambiyans","Animasyon","Dil","Parlaklık","Arka plan (siyah → gece)","Yıldız yoğunluğu","Parıltı","Dönüş","Kayan yıldız","Sıfırla","Şu an çalıyor","Çalma listesi","Geçiş","parça","Karıştır","Tekrarla"),
  pl: T("Atmosfera","Animacja","Język","Jasność","Tło (czarne → midnight)","Gęstość gwiazd","Migotanie","Obrót","Spadające gwiazdy","Resetuj","Teraz gra","Playlista","Przenikanie","utworów","Losowo","Powtórz"),
  uk: T("Атмосфера","Анімація","Мова","Яскравість","Фон (чорний → midnight)","Щільність зірок","Мерехтіння","Обертання","Падаючі зірки","Скинути","Зараз грає","Плейлист","Перехід","треків","Перемішати","Повтор"),
  ro: T("Atmosferă","Animație","Limbă","Luminozitate","Fundal (negru → midnight)","Densitate stele","Sclipire","Rotație","Stele căzătoare","Resetare","Redare curentă","Playlist","Tranziție","piese","Aleatoriu","Repetare"),
  nl: T("Sfeer","Animatie","Taal","Helderheid","Achtergrond (zwart → midnight)","Sterdichtheid","Fonkeling","Rotatie","Vallende sterren","Herstellen","Speelt nu","Afspeellijst","Overgang","nummers","Willekeurig","Herhalen"),
  el: T("Ατμόσφαιρα","Κίνηση","Γλώσσα","Φωτεινότητα","Φόντο (μαύρο → midnight)","Πυκνότητα αστεριών","Αστραφτερό","Περιστροφή","Πεφταστέρια","Επαναφορά","Παίζει τώρα","Λίστα","Σταδιακή μετάβαση","κομμάτια","Τυχαία","Επανάληψη"),
  cs: T("Atmosféra","Animace","Jazyk","Jas","Pozadí (černé → midnight)","Hustota hvězd","Třpyt","Rotace","Padající hvězdy","Resetovat","Právě hraje","Playlist","Prolínání","skladeb","Náhodně","Opakovat"),
  hu: T("Hangulat","Animáció","Nyelv","Fényerő","Háttér (fekete → midnight)","Csillagsűrűség","Csillogás","Forgás","Hullócsillagok","Visszaállítás","Most játszik","Lejátszási lista","Átúsztatás","szám","Keverés","Ismétlés"),
  sv: T("Stämning","Animation","Språk","Ljusstyrka","Bakgrund (svart → midnatt)","Stjärntäthet","Glimmer","Rotation","Stjärnfall","Återställ","Spelar nu","Spellista","Övergång","spår","Blanda","Upprepa"),
  no: T("Stemning","Animasjon","Språk","Lysstyrke","Bakgrunn (svart → midnatt)","Stjernetetthet","Glimt","Rotasjon","Stjerneskudd","Tilbakestill","Spiller nå","Spilleliste","Overgang","spor","Tilfeldig","Gjenta"),
  da: T("Stemning","Animation","Sprog","Lysstyrke","Baggrund (sort → midnat)","Stjernetæthed","Glimten","Rotation","Stjerneskud","Nulstil","Spiller nu","Afspilningsliste","Overgang","numre","Tilfældig","Gentag"),
  fi: T("Tunnelma","Animaatio","Kieli","Kirkkaus","Tausta (musta → midnight)","Tähtitiheys","Tuike","Pyöritys","Tähdenlento","Nollaa","Nyt soi","Soittolista","Ristiinhäivytys","kappaletta","Sekoita","Toista"),
  mg: T("Rivotra","Fihetsiketsehana","Fiteny","Hazavana","Ambadika (mainty → midnait)","Habetsahan'ny kintana","Famirapiratana","Fihodinana","Kintana milatsaka","Averina","Alefa izao","Lisitry ny hira","Fifandimbiasana","hira","Afangaro","Averina"),
  sw: T("Mazingira","Uhuishaji","Lugha","Mwangaza","Mandharinyuma (nyeusi → usiku)","Msongamano wa nyota","Kung'aa","Mzunguko","Nyota zinazopita","Weka upya","Inacheza sasa","Orodha","Mchanganyiko","nyimbo","Changanya","Rudia"),
  am: T("ድባብ","እንቅስቃሴ","ቋንቋ","ብሩህነት","ዳራ (ጥቁር → ሌሊት)","የኮከብ ጥግግት","ብልጭልጭ","ሽክርክሪት","ተወርዋሪ ኮከብ","ዳግም አስጀምር","አሁን እየተጫወተ","ዝርዝር","ማሻገር","ትራኮች","ድብልቅ","ድገም"),
  he: T("אווירה","אנימציה","שפה","בהירות","רקע (שחור → חצות)","צפיפות כוכבים","נצנוץ","סיבוב","כוכבים נופלים","איפוס","מתנגן עכשיו","רשימת השמעה","מעבר הדרגתי","שירים","ערבוב","חזרה"),
  fa: T("فضا","انیمیشن","زبان","روشنایی","پس‌زمینه (سیاه → نیمه‌شب)","تراکم ستاره","سوسو","چرخش","شهاب","بازنشانی","در حال پخش","لیست پخش","محو متقاطع","آهنگ","تصادفی","تکرار"),
  ka: T("ატმოსფერო","ანიმაცია","ენა","სიკაშკაშე","ფონი (შავი → შუაღამე)","ვარსკვლავთა სიმჭიდროვე","ციმციმი","ბრუნვა","ვარსკვლავთცვენა","გადატვირთვა","ახლა უკრავს","სია","გადასვლა","ტრეკი","შერევა","გამეორება"),
  az: T("Atmosfer","Animasiya","Dil","Parlaqlıq","Fon (qara → gecə)","Ulduz sıxlığı","Parıltı","Fırlanma","Axan ulduz","Sıfırla","İndi oxuyur","Siyahı","Keçid","mahnı","Qarışdır","Təkrarla"),
  uz: T("Muhit","Animatsiya","Til","Yorqinlik","Fon (qora → tun)","Yulduz zichligi","Miltillash","Aylanish","Uchuvchi yulduz","Tiklash","Hozir ijro","Pleylist","Oʻtish","trek","Aralashtirish","Takrorlash"),
  kk: T("Атмосфера","Анимация","Тіл","Жарықтық","Фон (қара → түн)","Жұлдыз тығыздығы","Жыпылықтау","Айналу","Құлаған жұлдыз","Қалпына келтіру","Қазір ойнатылуда","Ойнату тізімі","Ауысу","трек","Араластыру","Қайталау"),
};

export const LANGUAGES = [
  // Europe — West
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "nl", label: "Nederlands" },
  // Europe — South
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "ro", label: "Română" },
  { code: "el", label: "Ελληνικά" },
  { code: "tr", label: "Türkçe" },
  // Europe — North
  { code: "sv", label: "Svenska" },
  { code: "no", label: "Norsk" },
  { code: "da", label: "Dansk" },
  { code: "fi", label: "Suomi" },
  // Europe — East
  { code: "ru", label: "Русский" },
  { code: "uk", label: "Українська" },
  { code: "pl", label: "Polski" },
  { code: "cs", label: "Čeština" },
  { code: "hu", label: "Magyar" },
  { code: "ka", label: "ქართული" },
  { code: "az", label: "Azərbaycan" },
  { code: "kk", label: "Қазақ" },
  { code: "uz", label: "Oʻzbek" },
  // Middle East
  { code: "ar", label: "العربية" },
  { code: "he", label: "עברית" },
  { code: "fa", label: "فارسی" },
  { code: "ur", label: "اردو" },
  // South Asia
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "mr", label: "मराठी" },
  // East Asia
  { code: "zh", label: "中文 (简体)" },
  { code: "zh-tw", label: "中文 (繁體)" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  // Southeast Asia
  { code: "th", label: "ไทย" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "tl", label: "Filipino" },
  // Africa
  { code: "sw", label: "Kiswahili" },
  { code: "am", label: "አማርኛ" },
  { code: "mg", label: "Malagasy" },
];

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState("fr");
  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
