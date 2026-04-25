import React, { useState, useEffect, useMemo, useRef } from 'react';

import { initializeApp } from 'firebase/app';

import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, setDoc, writeBatch } from 'firebase/firestore';

import { Shield, Fingerprint, Globe, FileText, Scan, CheckCircle, XCircle, AlertTriangle, Users, LogOut, Plus, Search, Eye, Camera, Settings, UserPlus, Briefcase, CheckSquare, DownloadCloud, Layers, Edit, Copy, Check, Printer, Image as ImageIcon, Trash2 } from 'lucide-react';



// --- FIREBASE KURULUMU ---

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {

  // Kendi bilgilerin

};



const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'ulke-vize-sistemi';



const getCollectionRef = (colName) => collection(db, 'artifacts', appId, 'public', 'data', colName);

const getDocRef = (colName, docId) => doc(db, 'artifacts', appId, 'public', 'data', colName, docId);



// Dünyadaki Ülkeler (Kompakt format)

const WORLD_COUNTRIES_DATA = "Afganistan|🇦🇫,Almanya|🇩🇪,Amerika Birleşik Devletleri|🇺🇸,Andorra|🇦🇩,Angola|🇦🇴,Antigua ve Barbuda|🇦🇬,Arjantin|🇦🇷,Arnavutluk|🇦🇱,Avustralya|🇦🇺,Avusturya|🇦🇹,Azerbaycan|🇦🇿,Bahamalar|🇧🇸,Bahreyn|🇧🇭,Bangladeş|🇧🇩,Barbados|🇧🇧,Belçika|🇧🇪,Belize|🇧🇿,Benin|🇧🇯,Beyaz Rusya|🇧🇾,Bhutan|🇧🇹,Birleşik Arap Emirlikleri|🇦🇪,Birleşik Krallık|🇬🇧,Bolivya|🇧🇴,Bosna Hersek|🇧🇦,Botsvana|🇧🇼,Brezilya|🇧🇷,Brunei|🇧🇳,Bulgaristan|🇧🇬,Burkina Faso|🇧🇫,Burundi|🇧🇮,Cezayir|🇩🇿,Cibuti|🇩🇯,Çad|🇹🇩,Çekya|🇨🇿,Çin|🇨🇳,Danimarka|🇩🇰,Doğu Timor|🇹🇱,Dominik Cumhuriyeti|🇩🇴,Ekvador|🇪🇨,Ekvator Ginesi|🇬🇶,El Salvador|🇸🇻,Endonezya|🇮🇩,Eritre|🇪🇷,Ermenistan|🇦🇲,Estonya|🇪🇪,Etiyopya|🇪🇹,Fas|🇲🇦,Fiji|🇫🇯,Fildişi Sahili|🇨🇮,Filipinler|🇵🇭,Filistin|🇵🇸,Finlandiya|🇫🇮,Fransa|🇫🇷,Gabon|🇬🇦,Gambiya|🇬🇲,Gana|🇬🇭,Gine|🇬🇳,Gine-Bissau|🇬🇼,Grenada|🇬🇩,Guatemala|🇬🇹,Guyana|🇬🇾,Güney Afrika|🇿🇦,Güney Kore|🇰🇷,Güney Sudan|🇸🇸,Gürcistan|🇬🇪,Haiti|🇭🇹,Hırvatistan|🇭🇷,Hindistan|🇮🇳,Hollanda|🇳🇱,Honduras|🇭🇳,Irak|🇮🇶,İran|🇮🇷,İrlanda|🇮🇪,İspanya|🇪🇸,İsrail|🇮🇱,İsveç|🇸🇪,İsviçre|🇨🇭,İtalya|🇮🇹,İzlanda|🇮🇸,Jamaika|🇯🇲,Japonya|🇯🇵,Kamboçya|🇰🇭,Kamerun|🇨🇲,Kanada|🇨🇦,Karadağ|🇲🇪,Katar|🇶🇦,Kazakistan|🇰🇿,Kenya|🇰🇪,Kırgızistan|🇰🇬,Kolombiya|🇨🇴,Komorlar|🇰🇲,Kongo|🇨🇬,Kosta Rika|🇨🇷,Kuveyt|🇰🇼,Kuzey Kore|🇰🇵,Kuzey Makedonya|🇲🇰,Küba|🇨🇺,Laos|🇱🇦,Lesotho|🇱🇸,Letonya|🇱🇻,Liberya|🇱🇷,Libya|🇱🇾,Liechtenstein|🇱🇮,Litvanya|🇱🇹,Lübnan|🇱🇧,Lüksemburg|🇱🇺,Macaristan|🇭🇺,Madagaskar|🇲🇬,Malavi|🇲🇼,Maldivler|🇲🇻,Malezya|🇲🇾,Mali|🇲🇱,Malta|🇲🇹,Mauritius|🇲🇺,Meksika|🇲🇽,Mısır|🇪🇬,Moğolistan|🇲🇳,Moldova|🇲🇩,Monako|🇲🇨,Moritanya|🇲🇷,Mozambik|🇲🇿,Myanmar|🇲🇲,Namibya|🇳🇦,Nauru|🇳🇷,Nepal|🇳🇵,Nikaragua|🇳🇮,Nijer|🇳🇪,Nijerya|🇳🇬,Norveç|🇳🇴,Orta Afrika|🇨🇫,Özbekistan|🇺🇿,Pakistan|🇵🇰,Panama|🇵🇦,Papua Yeni Gine|🇵🇬,Paraguay|🇵🇾,Peru|🇵🇪,Polonya|🇵🇱,Portekiz|🇵🇹,Romanya|🇷🇴,Ruanda|🇷🇼,Rusya|🇷🇺,San Marino|🇸🇲,Sao Tome ve Principe|🇸🇹,Senegal|🇸🇳,Seyşeller|🇸🇨,Sırbistan|🇷🇸,Singapur|🇸🇬,Slovakya|🇸🇰,Slovenya|🇸🇮,Solomon Adaları|🇸🇧,Somali|🇸🇴,Sri Lanka|🇱🇰,Sudan|🇸🇩,Surinam|🇸🇷,Suriye|🇸🇾,Suudi Arabistan|🇸🇦,Şili|🇨🇱,Tacikistan|🇹🇯,Tanzanya|🇹🇿,Tayland|🇹🇭,Tayvan|🇹🇼,Togo|🇹🇬,Trinidad ve Tobago|🇹🇹,Tunus|🇹🇳,Türkiye|🇹🇷,Türkmenistan|🇹🇲,Uganda|🇺🇬,Ukrayna|🇺🇦,Umman|🇴🇲,Uruguay|🇺🇾,Ürdün|🇯🇴,Vanuatu|🇻🇺,Vatikan|🇻🇦,Venezuela|🇻🇪,Vietnam|🇻🇳,Yemen|🇾🇪,Yeni Zelanda|🇳🇿,Yeşil Burun Adaları|🇨🇻,Yunanistan|🇬🇷,Zambiya|🇿🇲,Zimbabve|🇿🇼";



// Yardımcı Fonksiyon: Resmi sıkıştırıp Base64 yapar

const compressImage = (file, callback) => {

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {

    const img = new Image();

    img.onload = () => {

      const canvas = document.createElement('canvas');

      const MAX_WIDTH = 250;

      const scaleSize = MAX_WIDTH / img.width;

      canvas.width = MAX_WIDTH;

      canvas.height = img.height * scaleSize;

      const ctx = canvas.getContext('2d');

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

      callback(dataUrl);

    };

    img.src = event.target.result;

  };

  reader.readAsDataURL(file);

};



// Vize Belgesindeki QR Kod Simülatörü

const PseudoQR = ({ value }) => {

  let num = 0;

  if(value) for(let i=0; i<value.length; i++) num += value.charCodeAt(i) * (i+1);

  const seed = Math.abs(Math.sin(num || 1));

  const dots = [];

  const addFinder = (x, y) => {

    dots.push(<rect key={`f1-${x}-${y}`} x={x*4} y={y*4} width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4"/>);

    dots.push(<rect key={`f2-${x}-${y}`} x={x*4+8} y={y*4+8} width="4" height="4" fill="currentColor"/>);

  };

  addFinder(0, 0); addFinder(11, 0); addFinder(0, 11);

  for(let i=0; i<16; i++){

    for(let j=0; j<16; j++){

       const inFinder = (i<6&&j<6) || (i>9&&j<6) || (i<6&&j>9);

       if(!inFinder && Math.abs(Math.sin(seed * (i+1) * (j+1))) > 0.45) {

          dots.push(<rect key={`${i}-${j}`} x={i*4} y={j*4} width="4" height="4" fill="currentColor"/>);

       }

    }

  }

  return <svg viewBox="-2 -2 68 68" className="w-20 h-20 text-slate-800"><g>{dots}</g></svg>

};



export default function App() {

  const [user, setUser] = useState(null);

  const [authInitialized, setAuthInitialized] = useState(false);

  const [activeUser, setActiveUser] = useState(null); 

  const [settings, setSettings] = useState(null);

  const [policeUsers, setPoliceUsers] = useState([]);

  const [countries, setCountries] = useState([]);

  const [visas, setVisas] = useState([]);

  const [entries, setEntries] = useState([]);

  const [toast, setToast] = useState(null);



  const showToast = (msg, type = 'info') => {

    setToast({ msg, type });

    setTimeout(() => setToast(null), 3000);

  };



  useEffect(() => {

    const initAuth = async () => {

      try {

        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {

          await signInWithCustomToken(auth, __initial_auth_token);

        } else {

          await signInAnonymously(auth);

        }

      } catch (error) { console.error("Auth Error:", error); }

    };

    initAuth();



    const unsubscribe = onAuthStateChanged(auth, (u) => {

      setUser(u);

      setAuthInitialized(true);

    });

    return () => unsubscribe();

  }, []);



  useEffect(() => {

    if (!user) return;

    const unsubSettings = onSnapshot(getDocRef('settings', 'general'), (doc) => setSettings(doc.exists() ? doc.data() : { isNew: true }));

    const unsubPolice = onSnapshot(query(getCollectionRef('police_users')), (snap) => setPoliceUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const unsubCountries = onSnapshot(query(getCollectionRef('countries')), (snap) => setCountries(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const unsubVisas = onSnapshot(query(getCollectionRef('visas')), (snap) => setVisas(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const unsubEntries = onSnapshot(query(getCollectionRef('entries')), (snap) => {

      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      data.sort((a, b) => b.timestamp - a.timestamp);

      setEntries(data);

    });



    return () => { unsubSettings(); unsubPolice(); unsubCountries(); unsubVisas(); unsubEntries(); };

  }, [user]);



  if (!authInitialized) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white"><Scan className="animate-spin w-10 h-10 text-blue-500" /></div>;



  if (!activeUser) return <LoginScreen setActiveUser={setActiveUser} policeUsers={policeUsers} settings={settings} showToast={showToast} />;



  return (

    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30">

      <style>{`

        @media print {

          body { background: white; color: black; }

          #app-navbar, #app-tabs, .no-print { display: none !important; }

          #printable-visa { display: block !important; position: absolute; left: 0; top: 0; width: 100%; }

        }

      `}</style>



      <nav id="app-navbar" className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center shadow-lg relative z-20">

        <div className="flex items-center gap-3">

          {settings && settings.hostFlag ? <span className="text-3xl drop-shadow-md">{settings.hostFlag}</span> : <Shield className="w-8 h-8 text-blue-500" />}

          <h1 className="text-xl font-bold tracking-wider text-white uppercase shadow-sm">

            {settings && settings.hostCountryName ? `${settings.hostCountryName} Sınır Kontrol` : 'Giriş Kontrol Sistemi'}

          </h1>

        </div>

        <div className="flex items-center gap-4">

          <div className="text-sm"><span className="text-slate-400">Aktif: </span><span className="font-semibold text-blue-400">{activeUser.role === 'superadmin' ? 'Sistem Yöneticisi' : `${activeUser.rank || 'Memur'} ${activeUser.name}`}</span></div>

          <button onClick={() => setActiveUser(null)} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-red-400" title="Çıkış Yap"><LogOut className="w-5 h-5" /></button>

        </div>

      </nav>



      <main className="p-6 max-w-7xl mx-auto relative z-10">

        <UnifiedDashboard 

          activeUser={activeUser} settings={settings} policeUsers={policeUsers}

          countries={countries} visas={visas} entries={entries} showToast={showToast} 

        />

      </main>



      {toast && (

        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up no-print">

          <div className={`px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-500/90' : toast.type === 'success' ? 'bg-green-500/90' : 'bg-blue-500/90'} text-white backdrop-blur-sm border border-white/20`}>

            {toast.type === 'error' ? <XCircle className="w-5 h-5"/> : toast.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertTriangle className="w-5 h-5"/>}

            <span className="font-medium">{toast.msg}</span>

          </div>

        </div>

      )}

    </div>

  );

}



function LoginScreen({ setActiveUser, policeUsers, settings, showToast }) {

  const [tab, setTab] = useState('police');

  const [adminPass, setAdminPass] = useState('');

  const [username, setUsername] = useState('');

  const [password, setPassword] = useState('');



  const handleLogin = (e) => {

    e.preventDefault();

    if (tab === 'admin') {

      if (adminPass === 'NPM5') {

        setActiveUser({ role: 'superadmin', name: 'Yönetici', permissions: ['border', 'visas', 'countries', 'logs', 'users', 'settings'] });

        showToast('Sistem Yönetici paneline yetkili giriş yapıldı.', 'success');

      } else showToast('Hatalı yönetici şifresi!', 'error');

    } else {

      const user = policeUsers.find(u => u.username === username && u.password === password);

      if (user) {

        const perms = user.permissions && user.permissions.length > 0 ? user.permissions : ['border'];

        setActiveUser({ ...user, role: 'police', permissions: perms });

        showToast(`Sisteme başarıyla giriş yapıldı. Görevinde başarılar, ${user.rank} ${user.name}.`, 'success');

      } else showToast('Kullanıcı adı veya şifre hatalı!', 'error');

    }

  };



  return (

    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center relative">

      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/95 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-md">

        <div className="flex flex-col items-center mb-8 text-center">

          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 border-2 border-slate-600 shadow-lg overflow-hidden">

            {settings && settings.hostFlag ? <span className="text-5xl">{settings.hostFlag}</span> : <Shield className="w-10 h-10 text-blue-400" />}

          </div>

          <h2 className="text-2xl font-black text-white tracking-wide uppercase">{settings && settings.hostCountryName ? settings.hostCountryName : 'ULUSAL'} GÜVENLİK SİSTEMİ</h2>

          <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-semibold">Sınır Kontrol & Vize Yönetimi</p>

        </div>



        <div className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">

          <button type="button" className={`flex-1 py-2.5 rounded-md text-sm font-bold transition-all ${tab === 'police' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`} onClick={() => setTab('police')}>Personel Girişi</button>

          <button type="button" className={`flex-1 py-2.5 rounded-md text-sm font-bold transition-all ${tab === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`} onClick={() => setTab('admin')}>Sistem Yönetimi</button>

        </div>



        <form onSubmit={handleLogin} className="space-y-5">

          {tab === 'police' ? (

            <>

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-1">Kullanıcı Adı (Sicil No)</label>

                <div className="relative"><Users className="absolute left-3 top-3 w-5 h-5 text-slate-500" /><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Örn: POL-001" required /></div>

              </div>

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-1">Şifre</label>

                <div className="relative"><Fingerprint className="absolute left-3 top-3 w-5 h-5 text-slate-500" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="******" required /></div>

              </div>

            </>

          ) : (

            <div>

              <label className="block text-sm font-medium text-slate-300 mb-1">Sistem Yöneticisi Şifresi</label>

              <div className="relative"><Shield className="absolute left-3 top-3 w-5 h-5 text-slate-500" /><input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Yönetici şifresi" required /></div>

            </div>

          )}

          <button type="submit" className={`w-full py-3.5 rounded-lg font-bold text-white transition-all shadow-lg flex justify-center items-center gap-2 mt-2 ${tab === 'police' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>Sisteme Giriş Yap</button>

        </form>

      </div>

    </div>

  );

}



function UnifiedDashboard({ activeUser, settings, policeUsers, countries, visas, entries, showToast }) {

  const [tab, setTab] = useState(activeUser.permissions[0] || 'border');



  if (settings?.isNew || !settings?.hostCountryName) {

    if (activeUser.role !== 'superadmin') return <div className="text-center text-red-400 mt-20 text-xl font-bold">Sistem kurulumu henüz tamamlanmadı. Lütfen yönetici ile iletişime geçin.</div>;

    return <SystemSetupModal showToast={showToast} />;

  }



  const hasPerm = (p) => activeUser.permissions.includes(p);



  return (

    <div>

      <div id="app-tabs" className="flex flex-wrap gap-2 mb-6 bg-slate-800 p-2 rounded-xl border border-slate-700 shadow-sm overflow-x-auto no-print">

        {hasPerm('border') && <button onClick={() => setTab('border')} className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${tab === 'border' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700 hover:text-white'} whitespace-nowrap`}><Scan className="w-5 h-5" /> Sınır Kontrolü</button>}

        {hasPerm('visas') && <button onClick={() => setTab('visas')} className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${tab === 'visas' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700 hover:text-white'} whitespace-nowrap`}><Briefcase className="w-5 h-5" /> Vize Merkezi</button>}

        {hasPerm('countries') && <button onClick={() => setTab('countries')} className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${tab === 'countries' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700 hover:text-white'} whitespace-nowrap`}><Globe className="w-5 h-5" /> Ülke Yönetimi</button>}

        {hasPerm('logs') && <button onClick={() => setTab('logs')} className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${tab === 'logs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700 hover:text-white'} whitespace-nowrap`}><FileText className="w-5 h-5" /> İşlem Kayıtları</button>}

        {hasPerm('users') && <button onClick={() => setTab('users')} className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${tab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700 hover:text-white'} whitespace-nowrap`}><Users className="w-5 h-5" /> Personel</button>}

        {hasPerm('settings') && <button onClick={() => setTab('settings')} className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${tab === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700 hover:text-white'} whitespace-nowrap`}><Settings className="w-5 h-5" /> Sistem</button>}

      </div>



      <div className="animate-fade-in-up">

        {tab === 'border' && <BorderControl activeUser={activeUser} settings={settings} countries={countries} visas={visas} showToast={showToast} />}

        {tab === 'visas' && <VisaCenter settings={settings} countries={countries} visas={visas} showToast={showToast} />}

        {tab === 'countries' && <CountryManagement countries={countries} showToast={showToast} />}

        {tab === 'logs' && <LogViewer entries={entries} showToast={showToast} settings={settings} />}

        {tab === 'users' && <UserManagement policeUsers={policeUsers} showToast={showToast} />}

        {tab === 'settings' && <AdminSettings settings={settings} showToast={showToast} />}

      </div>

    </div>

  );

}



// --- İlk Kurulum Modalı ---

function SystemSetupModal({ showToast }) {

  const [name, setName] = useState('');

  const [flag, setFlag] = useState('');

  const handleSetup = async (e) => {

    e.preventDefault();

    if (!name || !flag) return showToast('Lütfen ülke adı ve bayrağını girin.', 'error');

    try {

      await setDoc(getDocRef('settings', 'general'), { hostCountryName: name, hostFlag: flag, setupDate: Date.now() });

      showToast('Sistem başarıyla kuruldu!', 'success');

    } catch (err) { showToast('Kurulum hatası!', 'error'); }

  };

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">

      <div className="bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-indigo-500/30 p-8 text-center animate-fade-in-up">

        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><Settings className="w-10 h-10 text-indigo-400 animate-spin-slow" /></div>

        <h2 className="text-2xl font-black text-white mb-2">Sisteme Hoş Geldiniz</h2>

        <p className="text-slate-400 text-sm mb-8">Lütfen Sınır Kontrol Sisteminin ait olduğu ana ülkeyi belirleyin.</p>

        <form onSubmit={handleSetup} className="space-y-4 text-left">

          <div><label className="block text-sm font-medium text-slate-300 mb-1">Ev Sahibi Ülke Adı</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500" placeholder="Örn: Türkiye Cumhuriyeti" required /></div>

          <div><label className="block text-sm font-medium text-slate-300 mb-1">Ülke Bayrağı (Emoji)</label><input type="text" value={flag} onChange={e => setFlag(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-2xl text-center focus:ring-2 focus:ring-indigo-500" placeholder="🇹🇷" required /></div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-lg mt-6 shadow-lg shadow-indigo-500/25">Sistemi Başlat</button>

        </form>

      </div>

    </div>

  );

}



// --- UI Bileşeni: Resim Yükleme ---

function ImageUploadBox({ label, imageBase64, onUpload, icon: Icon, isOptional = false }) {

  return (

    <div className="flex flex-col gap-1">

      <label className="block text-xs text-slate-400 uppercase flex justify-between">

        {label} {isOptional && <span className="text-slate-600">(İsteğe Bağlı)</span>}

      </label>

      <label className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${imageBase64 ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-600 bg-slate-800 hover:bg-slate-700'}`}>

        {imageBase64 ? (

          <img src={imageBase64} alt="Preview" className="h-full w-full object-cover rounded-lg p-1 opacity-90" />

        ) : (

          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">

            <Icon className="w-8 h-8 mb-2" />

            <span className="text-xs font-bold uppercase tracking-wider">Yükle</span>

          </div>

        )}

        <input type="file" className="hidden" accept="image/*" onChange={(e) => compressImage(e.target.files[0], onUpload)} />

        {imageBase64 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg"><span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded">Değiştir</span></div>}

      </label>

    </div>

  );

}



// --- Vize Baskı / Yazdırma Modalı (Avrupa Birliği Vizesi Formatı) ---

function PrintableVisaModal({ visa, country, settings, onClose }) {

  const issueDate = new Date(visa.issuedAt);

  const expiryDate = new Date(visa.issuedAt);

  if (visa.duration) expiryDate.setDate(expiryDate.getDate() + parseInt(visa.duration));



  const generateMRZ = () => {

    // Rastgele Makine Okunabilir Bölge (MRZ)

    const pt1 = `V<${country?.name.substring(0,3).toUpperCase() || 'UTO'}${visa.travelerName.replace(/\s+/g, '<').toUpperCase()}<<<<<<<<<<<<<<<<<<`;

    const pt2 = `${visa.passportNo.padEnd(9,'<')}${country?.name.substring(0,1).toUpperCase()}<<<<<<<<<<<<<<<<<<<<<<<<<`;

    return [pt1.substring(0, 36), pt2.substring(0, 36)];

  };

  const mrz = generateMRZ();



  return (

    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md overflow-y-auto print:bg-white print:items-start p-4">

      <div id="printable-visa" className="bg-white text-slate-900 w-[700px] max-w-full rounded-xl shadow-2xl relative overflow-hidden border border-slate-300 print:shadow-none print:border-none print:w-[15cm] print:h-[10cm] print:p-0">

        

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }}>

          <Globe className="w-96 h-96" />

        </div>

        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600"></div>



        <div className="p-8 pb-4 relative z-10">

          <div className="flex justify-between items-start mb-6 border-b border-emerald-100 pb-4">

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-200">

                <span className="text-4xl">{settings?.hostFlag}</span>

              </div>

              <div>

                <h2 className="text-3xl font-black text-emerald-800 tracking-widest uppercase">VİZE <span className="text-emerald-300">|</span> VISA</h2>

                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{settings?.hostCountryName} GÖÇ İDARESİ</p>

              </div>

            </div>

            <div className="text-right">

              <div className="text-xs font-bold text-slate-400 uppercase mb-1">Vize Numarası / Visa No.</div>

              <div className="text-2xl font-mono font-bold text-red-600">{visa.visaId}</div>

            </div>

          </div>



          <div className="flex gap-6 mb-6">

            <div className="w-32 flex-shrink-0">

              <div className="w-32 h-40 border-2 border-emerald-200 p-1 bg-white shadow-sm relative">

                {visa.profilePhoto ? <img src={visa.profilePhoto} className="w-full h-full object-cover filter contrast-125 grayscale" alt="Passenger" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center"><Users className="text-slate-300 w-10 h-10"/></div>}

                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-400/20 to-transparent mix-blend-overlay"></div>

              </div>

            </div>



            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3">

              <div className="col-span-2 border-b border-dashed border-slate-300 pb-1">

                <span className="block text-[10px] font-bold text-emerald-600 uppercase">Geçerli Ülke / Valid For</span>

                <span className="font-bold text-lg uppercase tracking-wide">{settings?.hostCountryName}</span>

              </div>

              

              <div className="border-b border-dashed border-slate-300 pb-1">

                <span className="block text-[10px] font-bold text-emerald-600 uppercase">Başlangıç / From</span>

                <span className="font-bold">{issueDate.toLocaleDateString('tr-TR')}</span>

              </div>

              <div className="border-b border-dashed border-slate-300 pb-1">

                <span className="block text-[10px] font-bold text-emerald-600 uppercase">Bitiş / Until</span>

                <span className="font-bold">{visa.duration ? expiryDate.toLocaleDateString('tr-TR') : 'SÜRESİZ'}</span>

              </div>



              <div className="border-b border-dashed border-slate-300 pb-1">

                <span className="block text-[10px] font-bold text-emerald-600 uppercase">Giriş Sayısı / Entries</span>

                <span className="font-bold">{visa.entryType === 'Çoklu (Multiple)' ? 'MULT' : '01'}</span>

              </div>

              <div className="border-b border-dashed border-slate-300 pb-1">

                <span className="block text-[10px] font-bold text-emerald-600 uppercase">Kalış Süresi / Duration of Stay</span>

                <span className="font-bold">{visa.duration ? `${visa.duration} DAYS` : 'XXX'}</span>

              </div>



              <div className="col-span-2 border-b border-dashed border-slate-300 pb-1 flex justify-between items-center">

                 <div>

                    <span className="block text-[10px] font-bold text-emerald-600 uppercase">Pasaport No / Passport Number</span>

                    <span className="font-mono font-bold text-lg">{visa.passportNo}</span>

                 </div>

                 {/* QR KOD ALANI */}

                 <div className="bg-white p-1 border border-slate-200 rounded mr-2">

                    <PseudoQR value={visa.visaId} />

                 </div>

              </div>



              <div className="col-span-2 border-b border-dashed border-slate-300 pb-1">

                <span className="block text-[10px] font-bold text-emerald-600 uppercase">Ad Soyad / Surname, Name</span>

                <span className="font-bold text-lg uppercase tracking-wide">{visa.travelerName}</span>

              </div>

              

              <div className="col-span-2 pb-1">

                <span className="block text-[10px] font-bold text-emerald-600 uppercase">Açıklamalar / Remarks</span>

                <span className="font-medium text-sm italic">{visa.purpose} {visa.profilePhoto ? '- Biyometrik Kayıtlı' : ''}</span>

              </div>

            </div>

          </div>



          {/* MRZ Area */}

          <div className="bg-emerald-50/50 p-3 rounded border border-emerald-100">

            <div className="font-mono text-[16px] tracking-[0.25em] font-bold text-slate-800 leading-relaxed whitespace-nowrap overflow-hidden">

              {mrz[0]}<br/>

              {mrz[1]}

            </div>

          </div>

        </div>

      </div>



      <div className="absolute top-6 right-6 flex gap-3 no-print">

        <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold shadow-2xl flex items-center gap-2 text-lg transition-all"><Printer className="w-5 h-5"/> Vizeyi Yazdır</button>

        <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-bold shadow-2xl transition-all">Kapat</button>

      </div>

    </div>

  );

}





// --- Vize Merkezi ---

function VisaCenter({ settings, countries, visas, showToast }) {

  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({ 

    travelerName: '', passportNo: '', countryId: '', birthDate: '', nationality: '', 

    purpose: 'Turistik', duration: '', entryType: 'Tek (Single)', occupation: '', income: '', 

    profilePhoto: null, fingerprintPhoto: null, passportPhoto: null 

  });

  const [selectedPrintVisa, setSelectedPrintVisa] = useState(null);



  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!formData.travelerName || !formData.passportNo || !formData.countryId) return showToast('Temel alanlar zorunludur.', 'error');

    

    // Opsiyonel biyometrik kontroller kaldırıldı, fotoğraf yoksa da geçer.

    const prefix = countries.find(c => c.id === formData.countryId)?.name.substring(0,3).toUpperCase() || 'VIS';

    const generatedVisaId = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

    

    try {

      await addDoc(getCollectionRef('visas'), { ...formData, visaId: generatedVisaId, issuedAt: Date.now(), status: 'Aktif' });

      showToast('Resmi Vize Belgesi Düzenlendi. ID: ' + generatedVisaId, 'success');

      setIsAdding(false);

      setFormData({ travelerName: '', passportNo: '', countryId: '', birthDate: '', nationality: '', purpose: 'Turistik', duration: '', entryType: 'Tek (Single)', occupation: '', income: '', profilePhoto: null, fingerprintPhoto: null, passportPhoto: null });

    } catch (err) { showToast('Hata oluştu.', 'error'); }

  };



  const getCountryName = (cid) => countries.find(c => c.id === cid)?.name || 'Bilinmiyor';



  return (

    <div className="space-y-6">

      {selectedPrintVisa && (

        <PrintableVisaModal 

          visa={selectedPrintVisa} 

          country={countries.find(c => c.id === selectedPrintVisa.countryId)} 

          settings={settings}

          onClose={() => setSelectedPrintVisa(null)} 

        />

      )}



      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700 no-print">

        <div><h2 className="text-xl font-bold text-white">Konsolosluk Vize Merkezi</h2><p className="text-sm text-slate-400">Yabancı uyruklular için vizeler düzenleyin ve çıktılarını alın.</p></div>

        <button onClick={() => setIsAdding(!isAdding)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg">

          {isAdding ? <XCircle className="w-5 h-5"/> : <Briefcase className="w-5 h-5"/>} {isAdding ? 'İptal' : 'Yeni Vize Başvurusu'}

        </button>

      </div>



      {isAdding && (

        <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-xl border border-slate-600 shadow-2xl relative overflow-hidden no-print">

          <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 rounded-bl-xl text-xs font-bold tracking-widest uppercase">Resmi Belge</div>

          <h3 className="text-2xl font-black text-white mb-6 border-b border-slate-700 pb-4">VİZE BAŞVURU FORMU</h3>

          

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            <div className="lg:col-span-3 space-y-6">

              <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-700">

                <h4 className="text-indigo-400 font-bold mb-4 flex items-center gap-2"><Users className="w-4 h-4"/> 1. Kişisel ve Kimlik Bilgileri</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                  <div className="lg:col-span-2"><label className="block text-xs text-slate-400 mb-1 uppercase">Ad Soyad</label><input type="text" value={formData.travelerName} onChange={e => setFormData({...formData, travelerName: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" required /></div>

                  <div><label className="block text-xs text-slate-400 mb-1 uppercase">Doğum Tarihi</label><input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" /></div>

                  <div><label className="block text-xs text-slate-400 mb-1 uppercase">Uyruk (Yazı İle)</label><input type="text" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" /></div>

                  <div className="lg:col-span-2"><label className="block text-xs text-slate-400 mb-1 uppercase">Pasaport No</label><input type="text" value={formData.passportNo} onChange={e => setFormData({...formData, passportNo: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white font-mono uppercase" required /></div>

                  <div className="lg:col-span-2">

                    <label className="block text-xs text-slate-400 mb-1 uppercase">Vatandaşı Olduğu Ülke (Sistem Profili)</label>

                    <select value={formData.countryId} onChange={e => setFormData({...formData, countryId: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" required>

                      <option value="">Seçiniz...</option>{countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}

                    </select>

                  </div>

                </div>

              </div>

              <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4">

                <div><label className="block text-xs text-slate-400 mb-1 uppercase">Seyahat Amacı</label><select value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white"><option>Turistik</option><option>Ticari / İş</option><option>Eğitim</option><option>Aile Ziyareti</option><option>Sağlık</option></select></div>

                <div>

                   <label className="block text-xs text-slate-400 mb-1 uppercase">Giriş Hakkı</label>

                   <select value={formData.entryType} onChange={e => setFormData({...formData, entryType: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white"><option>Tek (Single)</option><option>Çoklu (Multiple)</option></select>

                </div>

                <div><label className="block text-xs text-slate-400 mb-1 uppercase">Kalış Süresi (Gün)</label><input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" placeholder="Örn: 15" /></div>

              </div>

            </div>

            <div className="space-y-4">

              {/* Hepsi isteğe bağlı (isOptional=true eklendi) */}

              <ImageUploadBox label="Yolcu Fotoğrafı" icon={ImageIcon} imageBase64={formData.profilePhoto} onUpload={data => setFormData({...formData, profilePhoto: data})} isOptional={true} />

              <ImageUploadBox label="Parmak İzi Taraması" icon={Fingerprint} imageBase64={formData.fingerprintPhoto} onUpload={data => setFormData({...formData, fingerprintPhoto: data})} isOptional={true} />

              <ImageUploadBox label="Pasaport Fotoğrafı" icon={FileText} imageBase64={formData.passportPhoto} onUpload={data => setFormData({...formData, passportPhoto: data})} isOptional={true} />

            </div>

          </div>

          <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-black text-lg py-4 rounded-lg mt-8 shadow-lg transition-all flex justify-center items-center gap-2"><CheckSquare className="w-6 h-6" /> VİZEYİ SİSTEME ONAYLAT</button>

        </form>

      )}



      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-sm no-print">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm text-slate-300">

            <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-700">

              <tr><th className="px-5 py-4 font-bold">Profil</th><th className="px-5 py-4 font-bold">Vize ID</th><th className="px-5 py-4 font-bold">Yolcu / Uyruk</th><th className="px-5 py-4 font-bold">Amacı / Hak</th><th className="px-5 py-4 font-bold text-right">Vize Belgesi</th></tr>

            </thead>

            <tbody className="divide-y divide-slate-700/50">

              {visas.map(v => (

                <tr key={v.id} className="hover:bg-slate-700/30 transition-colors">

                  <td className="px-5 py-4"><img src={v.profilePhoto || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-full border border-slate-600 object-cover opacity-80" alt="Profile" /></td>

                  <td className="px-5 py-4 font-mono font-bold text-blue-400">{v.visaId}</td>

                  <td className="px-5 py-4"><div className="font-bold text-white">{v.travelerName}</div><div className="text-xs text-slate-500">{v.passportNo} • {getCountryName(v.countryId)}</div></td>

                  <td className="px-5 py-4"><div className="font-medium text-indigo-300">{v.purpose}</div><div className="text-xs text-slate-400">{v.entryType}</div></td>

                  <td className="px-5 py-4 text-right">

                    <button 

                      onClick={() => setSelectedPrintVisa(v)} 

                      className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white px-3 py-2 rounded-lg font-bold transition-colors inline-flex items-center gap-2"

                    >

                      <Printer className="w-4 h-4"/> Çıktı Al

                    </button>

                  </td>

                </tr>

              ))}

              {visas.length === 0 && <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-500">Sistemde onaylanmış vize bulunmuyor.</td></tr>}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}



// --- Sınır Kontrolü ---

function BorderControl({ activeUser, settings, countries, visas, showToast }) {

  const [step, setStep] = useState('scan');

  const [scanInput, setScanInput] = useState('');

  const [isScanning, setIsScanning] = useState(false);

  const [activeVisa, setActiveVisa] = useState(null);

  const [activeCountry, setActiveCountry] = useState(null);

  const [answers, setAnswers] = useState({});

  const [submitting, setSubmitting] = useState(false);



  const handleSimulateScan = () => {

    setIsScanning(true);

    setTimeout(() => {

      setIsScanning(false);

      if (visas.length === 0) return showToast('Sistemde taranacak vize yok!', 'error');

      const randomVisa = visas[Math.floor(Math.random() * visas.length)];

      setScanInput(randomVisa.visaId);

      processVisaInfo(randomVisa.visaId);

    }, 1500);

  };



  const processVisaInfo = (vid) => {

    const v = visas.find(x => x.visaId.toLowerCase() === vid.toLowerCase() || x.passportNo.toLowerCase() === vid.toLowerCase());

    if (!v) return showToast('Geçersiz Vize veya Pasaport Numarası!', 'error');

    const c = countries.find(x => x.id === v.countryId);

    if (!c) return showToast('Vizeye ait ülke bilgisi bulunamadı!', 'error');

    

    setActiveVisa(v); setActiveCountry(c); setAnswers({}); setStep('questionnaire');

    showToast('Vize kimlik onayı başarılı. Dosya açılıyor.', 'success');

  };



  // Güvenlik soruları

  const questionsToAsk = (activeCountry?.questions && activeCountry.questions.length > 0) 

    ? activeCountry.questions 

    : ['Seyahat amacınız nedir?', 'Nerede konaklayacaksınız?', 'Ne kadar nakit taşıyorsunuz?'];



  const handleDecision = async (status) => {

    const unanswered = questionsToAsk.some(q => !answers[q] || answers[q].trim() === '');

    if (unanswered && status !== 'Reddedildi') return showToast('Karar vermeden önce tüm soruları yanıtlayın!', 'error');

    

    setSubmitting(true);

    try {

      await addDoc(getCollectionRef('entries'), {

        policeName: `${activeUser.rank || 'Yönetici'} ${activeUser.name}`,

        travelerName: activeVisa.travelerName,

        passportNo: activeVisa.passportNo,

        countryName: activeCountry.name,

        visaId: activeVisa.visaId,

        status: status,

        answers: Object.entries(answers).map(([q, a]) => ({ question: q, answer: a })),

        timestamp: Date.now()

      });

      showToast(`Geçiş Kaydedildi: ${status}`, status === 'Onaylandı' ? 'success' : 'error');

      setStep('scan'); setActiveVisa(null); setActiveCountry(null); setScanInput('');

    } catch (error) { showToast('Kayıt hatası!', 'error'); } 

    finally { setSubmitting(false); }

  };



  return (

    <div className="max-w-5xl mx-auto space-y-6">

      {step === 'scan' && (

        <div className="bg-slate-800 rounded-2xl p-10 shadow-2xl border border-slate-700 animate-fade-in-up text-center relative overflow-hidden">

          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600"></div>

          <Scan className="w-20 h-20 text-blue-500 mx-auto mb-6 opacity-80" />

          <h2 className="text-3xl font-black text-white mb-2 tracking-wide uppercase">Sınır Kontrol İstasyonu</h2>

          <form onSubmit={(e) => { e.preventDefault(); processVisaInfo(scanInput); }} className="max-w-lg mx-auto space-y-5 mt-8">

            <div className="relative">

              <Search className="absolute left-4 top-4 w-6 h-6 text-slate-500" />

              <input type="text" value={scanInput} onChange={(e) => setScanInput(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-600 rounded-xl py-4 pl-14 pr-4 text-white focus:ring-4 focus:ring-blue-500/20 font-mono text-center text-xl transition-all shadow-inner" placeholder="VİZE-ID / PASAPORT" />

            </div>

            <div className="flex gap-4">

              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-lg flex justify-center items-center gap-2"><Search className="w-5 h-5"/> Sorgula</button>

              <button type="button" onClick={handleSimulateScan} disabled={isScanning} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl text-lg flex justify-center items-center gap-2"><Camera className="w-5 h-5"/> {isScanning ? 'Taranıyor...' : 'QR / Barkod Tara'}</button>

            </div>

          </form>

        </div>

      )}



      {step === 'questionnaire' && activeVisa && activeCountry && (

        <div className="space-y-6 animate-fade-in-up">

           {/* Yolcu Detayları (İsteğe bağlı resimler handle edildi) */}

           <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">

            <div className="bg-slate-900/80 p-4 border-b border-slate-700 flex justify-between items-center">

              <h3 className="font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Briefcase className="w-5 h-5"/> İstihbarat & Biyometrik Dosya</h3>

              <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold font-mono border border-indigo-500/30">ID: {activeVisa.visaId}</span>

            </div>

            <div className="p-6 flex flex-col md:flex-row gap-8">

                

                {/* Biyometrik Fotoğraf */}

                <div className="flex flex-col gap-2">

                  <div className="w-36 h-44 bg-slate-900 rounded-lg border-2 border-slate-700 overflow-hidden shadow-inner relative">

                    {activeVisa.profilePhoto ? <img src={activeVisa.profilePhoto} className="w-full h-full object-cover" alt="Profile"/> : <div className="flex items-center justify-center h-full text-slate-600"><UserPlus className="w-12 h-12"/></div>}

                    <div className={`absolute bottom-0 w-full bg-black/60 text-center py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${activeVisa.profilePhoto ? 'text-green-400' : 'text-slate-400'}`}>

                      {activeVisa.profilePhoto ? 'FOTO EŞLEŞTİ' : 'FOTO EKLENMEMİŞ'}

                    </div>

                  </div>

                </div>



                <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-6">

                  <div><span className="text-slate-500 block text-[10px] font-bold uppercase mb-1">Ad Soyad</span><span className="font-black text-xl text-white">{activeVisa.travelerName}</span></div>

                  <div><span className="text-slate-500 block text-[10px] font-bold uppercase mb-1">Pasaport</span><span className="font-mono font-bold text-xl text-blue-400">{activeVisa.passportNo}</span></div>

                  <div><span className="text-slate-500 block text-[10px] font-bold uppercase mb-1">Giriş Tipi</span><span className="font-bold text-white text-lg">{activeVisa.entryType}</span></div>

                  <div className="col-span-full mt-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700 flex items-center gap-4">

                      <span className="text-5xl drop-shadow-md">{activeCountry.flag}</span>

                      <div>

                        <p className="text-slate-400 text-[10px] font-bold uppercase mb-0.5">Yolcunun Vatandaşlığı (Uyruğu)</p>

                        <p className="font-bold text-white text-lg">{activeCountry.name} - {activeVisa.purpose} <span className="text-sm text-slate-400">({activeVisa.duration} Gün)</span></p>

                      </div>

                  </div>

                </div>



                {/* Parmak İzi */}

                <div className="flex flex-col gap-2 items-center justify-center">

                  <div className="w-28 h-32 bg-slate-900 rounded-lg border-2 border-slate-700 flex items-center justify-center overflow-hidden p-2">

                    {activeVisa.fingerprintPhoto ? <img src={activeVisa.fingerprintPhoto} className="h-full object-contain filter invert opacity-80" alt="Fingerprint"/> : <Fingerprint className="w-12 h-12 text-slate-600"/>}

                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${activeVisa.fingerprintPhoto ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-500 bg-slate-800 border-slate-600'}`}>

                    {activeVisa.fingerprintPhoto ? 'PARMAK İZİ MEVCUT' : 'KAYIT YOK'}

                  </span>

                </div>



                {/* Pasaport Fotoğrafı (Opsiyonel) */}

                {activeVisa.passportPhoto && (

                  <div className="flex flex-col gap-2 items-center justify-center">

                    <div className="w-28 h-32 bg-slate-900 rounded-lg border-2 border-slate-700 flex items-center justify-center overflow-hidden p-1 shadow-inner">

                      <img src={activeVisa.passportPhoto} className="h-full object-cover rounded" alt="Passport"/>

                    </div>

                    <span className="text-[10px] font-bold uppercase text-blue-400 tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">PASAPORT BEYANI</span>

                  </div>

                )}

            </div>

          </div>



          <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">

            <div className="bg-slate-900/80 p-4 border-b border-slate-700">

              <h3 className="font-black text-amber-500 uppercase tracking-widest flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Güvenlik Mülakatı</h3>

            </div>

            <div className="p-6">

               <div className="space-y-5">

                  {questionsToAsk.map((q, idx) => (

                    <div key={idx}>

                      <label className="block text-sm font-bold text-slate-200 mb-2 flex items-center gap-2"><span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 w-6 h-6 flex items-center justify-center rounded-full text-xs font-black">{idx + 1}</span> {q}</label>

                      <textarea rows={2} value={answers[q] || ''} onChange={(e) => setAnswers({...answers, [q]: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white focus:ring-2 focus:ring-amber-500 resize-none shadow-inner placeholder-slate-500" placeholder="Yolcunun beyanını eksiksiz şekilde buraya yazın..." />

                    </div>

                  ))}

                </div>

            </div>

          </div>



          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <button onClick={() => handleDecision('Onaylandı')} disabled={submitting} className="bg-green-600 hover:bg-green-500 text-white font-black py-5 rounded-2xl shadow-lg border border-green-500 transition-all flex flex-col items-center gap-2"><CheckCircle className="w-10 h-10" /> <span className="tracking-widest">GİRİŞİ ONAYLA</span></button>

            <button onClick={() => handleDecision('Ek Güvenlik')} disabled={submitting} className="bg-amber-600 hover:bg-amber-500 text-white font-black py-5 rounded-2xl shadow-lg border border-amber-500 transition-all flex flex-col items-center gap-2"><AlertTriangle className="w-10 h-10" /> <span className="tracking-widest">EK GÜVENLİĞE AL</span></button>

            <button onClick={() => handleDecision('Reddedildi')} disabled={submitting} className="bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl shadow-lg border border-red-500 transition-all flex flex-col items-center gap-2"><XCircle className="w-10 h-10" /> <span className="tracking-widest">DEPORT / RET</span></button>

          </div>

          

          <div className="text-center pb-8"><button onClick={() => { setStep('scan'); setScanInput(''); }} className="text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider underline">İptal Et</button></div>

        </div>

      )}

    </div>

  );

}



function CountryManagement({ countries, showToast }) {

  const [searchTerm, setSearchTerm] = useState('');

  const [isPopulating, setIsPopulating] = useState(false);

  const [editingCountry, setEditingCountry] = useState(null);



  const handleAutoPopulate = async () => {

    setIsPopulating(true);

    const countryList = WORLD_COUNTRIES_DATA.split(',').map(item => { const [name, flag] = item.split('|'); return { name, flag, idTypes: 'Pasaport, Çipli Kimlik', questions: [] }; });

    try {

      const batch = writeBatch(db); let addedCount = 0;

      for (const c of countryList) {

        if (!countries.some(existing => existing.name === c.name)) {

          const docRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'countries'));

          batch.set(docRef, c); addedCount++;

        }

      }

      if (addedCount > 0) { await batch.commit(); showToast(`${addedCount} adet ülke sisteme entegre edildi.`, 'success'); } 

      else showToast('Tüm ülkeler zaten sistemde.', 'info');

    } catch (err) { showToast('Yükleme hatası.', 'error'); } 

    finally { setIsPopulating(false); }

  };



  const filteredCountries = countries.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));



  return (

    <div className="space-y-6">

      <div className="flex flex-col lg:flex-row justify-between items-center bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md gap-4">

        <div className="flex-1 w-full relative">

          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />

          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Ülke Ara..." className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500" />

        </div>

        <div className="flex gap-2 w-full lg:w-auto">

          <button onClick={handleAutoPopulate} disabled={isPopulating} className="flex-1 lg:flex-none bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg font-medium flex justify-center items-center gap-2"><Globe className="w-5 h-5" />{isPopulating ? 'Yükleniyor...' : 'Tüm Ülkeleri Yükle'}</button>

          <button onClick={() => setEditingCountry({ isNew: true, name: '', flag: '', idTypes: 'Pasaport', questions: [] })} className="flex-1 lg:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-bold flex justify-center items-center gap-2 shadow-lg"><Plus className="w-5 h-5" /> Yeni Ekle</button>

        </div>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

        {filteredCountries.map(c => (

          <div key={c.id} onClick={() => setEditingCountry(c)} className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-indigo-500 cursor-pointer transition-all flex flex-col items-center text-center group relative">

            <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">{c.flag || '🏳️'}</div>

            <h3 className="font-bold text-white leading-tight mb-1">{c.name}</h3>

            <div className="mt-auto flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20 w-full mt-2"><FileText className="w-3 h-3"/> {(c.questions || []).length} Soru</div>

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><Edit className="w-4 h-4 text-slate-400" /></div>

          </div>

        ))}

      </div>

      {editingCountry && <CountryEditModal country={editingCountry} allCountries={countries} onClose={() => setEditingCountry(null)} showToast={showToast} />}

    </div>

  );

}



function CountryEditModal({ country, allCountries, onClose, showToast }) {

  const [formData, setFormData] = useState({ ...country, questions: country.questions || [] });

  const [saving, setSaving] = useState(false);

  const [copyQuestionText, setCopyQuestionText] = useState(null); 

  const [copyMode, setCopyMode] = useState('ALL'); 

  const [selectedCountryIds, setSelectedCountryIds] = useState([]);



  const handleSave = async (e) => {

    e.preventDefault();

    if (!formData.name) return showToast('Ülke adı zorunlu.', 'error');

    setSaving(true);

    try {

      const cleanData = { ...formData, questions: formData.questions.filter(q => q.trim() !== '') };

      if (country.isNew) { await addDoc(getCollectionRef('countries'), cleanData); showToast('Yeni ülke eklendi.', 'success'); } 

      else { await updateDoc(getDocRef('countries', country.id), cleanData); showToast('Ülke güncellendi.', 'success'); }

      onClose();

    } catch (err) { showToast('Kayıt hatası.', 'error'); } 

    finally { setSaving(false); }

  };



  const handleDelete = async () => {

    if (country.isNew) return onClose();

    try { await deleteDoc(getDocRef('countries', country.id)); showToast('Ülke silindi.', 'info'); onClose(); } 

    catch (err) { showToast('Silme hatası.', 'error'); }

  };



  const executeCopyQuestion = async () => {

    if (!copyQuestionText) return;

    try {

      const targets = copyMode === 'ALL' ? allCountries : allCountries.filter(c => selectedCountryIds.includes(c.id));

      const batch = writeBatch(db); let count = 0;

      for (const t of targets) {

        if (t.id === country.id) continue;

        const existingQs = t.questions || [];

        if (!existingQs.includes(copyQuestionText)) {

          batch.update(getDocRef('countries', t.id), { questions: [...existingQs, copyQuestionText] }); count++;

        }

      }

      if (count > 0) { await batch.commit(); showToast(`Soru ${count} ülkeye eklendi!`, 'success'); } 

      else showToast('Soru zaten mevcut.', 'info');

      setCopyQuestionText(null);

    } catch (err) { showToast('Uyarlama hatası!', 'error'); }

  };



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in-up">

      <div className="bg-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-600 flex flex-col max-h-[90vh]">

        <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/80">

          <div className="flex items-center gap-3"><span className="text-3xl">{formData.flag || '🏳️'}</span><h3 className="text-xl font-bold text-white">{country.isNew ? 'Yeni Ülke Ekle' : `${formData.name} Yapılandırması`}</h3></div>

          <button onClick={onClose} className="text-slate-400 hover:text-white"><XCircle className="w-6 h-6"/></button>

        </div>

        <div className="p-6 overflow-y-auto flex-1">

          {copyQuestionText && (

            <div className="absolute inset-0 z-50 bg-slate-900/95 flex items-center justify-center p-6 backdrop-blur-sm">

              <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50 w-full max-w-lg shadow-2xl">

                <h4 className="text-lg font-bold text-indigo-400 mb-2 flex items-center gap-2"><Copy className="w-5 h-5"/> Soruyu Dağıt</h4>

                <p className="text-sm text-slate-300 mb-4 bg-slate-900 p-3 rounded border border-slate-700 italic">"{copyQuestionText}"</p>

                <div className="flex gap-4 mb-4">

                  <label className="flex items-center gap-2 text-sm text-white"><input type="radio" checked={copyMode === 'ALL'} onChange={() => setCopyMode('ALL')} className="accent-indigo-500"/> Tüm Ülkelere</label>

                  <label className="flex items-center gap-2 text-sm text-white"><input type="radio" checked={copyMode === 'SELECTED'} onChange={() => setCopyMode('SELECTED')} className="accent-indigo-500"/> Seçili Ülkelere</label>

                </div>

                {copyMode === 'SELECTED' && (

                  <div className="h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded p-2 mb-4 space-y-1">

                    {allCountries.filter(c => c.id !== country.id).map(c => (

                      <label key={c.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-800 rounded cursor-pointer">

                        <input type="checkbox" checked={selectedCountryIds.includes(c.id)} onChange={(e) => { e.target.checked ? setSelectedCountryIds([...selectedCountryIds, c.id]) : setSelectedCountryIds(selectedCountryIds.filter(id => id !== c.id)); }} className="accent-indigo-500"/>

                        <span className="text-sm">{c.flag} {c.name}</span>

                      </label>

                    ))}

                  </div>

                )}

                <div className="flex gap-2"><button onClick={executeCopyQuestion} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold">Uygula</button><button onClick={() => setCopyQuestionText(null)} className="bg-slate-700 text-white px-4 rounded-lg">İptal</button></div>

              </div>

            </div>

          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            <div><label className="block text-sm text-slate-400 mb-1">Ülke Adı</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white font-bold" required /></div>

            <div className="flex gap-4">

              <div className="w-1/3"><label className="block text-sm text-slate-400 mb-1">Bayrak</label><input type="text" value={formData.flag} onChange={e => setFormData({...formData, flag: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white text-center text-xl" /></div>

              <div className="w-2/3"><label className="block text-sm text-slate-400 mb-1">Kabul Edilen Kimlikler</label><input type="text" value={formData.idTypes} onChange={e => setFormData({...formData, idTypes: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white" /></div>

            </div>

          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">

            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">

              <div><h4 className="font-bold text-indigo-400 flex items-center gap-2"><FileText className="w-5 h-5"/> Güvenlik Soruları</h4></div>

              <button onClick={() => setFormData({...formData, questions: [...formData.questions, '']})} className="bg-indigo-600/20 text-indigo-400 px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4"/> Soru Ekle</button>

            </div>

            <div className="space-y-3">

              {formData.questions.map((q, idx) => (

                <div key={idx} className="flex gap-2 items-start bg-slate-800 p-2 rounded-lg border border-slate-600 group">

                  <span className="bg-slate-900 text-slate-400 w-8 h-8 flex items-center justify-center rounded font-bold">{idx + 1}</span>

                  <div className="flex-1 space-y-2">

                    <input type="text" value={q} onChange={e => { const n = [...formData.questions]; n[idx] = e.target.value; setFormData({...formData, questions: n}); }} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white text-sm" placeholder="Soru..." />

                    {q.trim() !== '' && <button onClick={() => { setCopyQuestionText(q); setCopyMode('ALL'); setSelectedCountryIds([]); }} className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 font-bold flex items-center gap-1"><Copy className="w-3 h-3"/> Başka Ülkelere Uyarla</button>}

                  </div>

                  <button onClick={() => { const n = [...formData.questions]; n.splice(idx,1); setFormData({...formData, questions: n}); }} className="text-slate-500 hover:text-red-400 p-1.5"><XCircle className="w-5 h-5"/></button>

                </div>

              ))}

              {formData.questions.length === 0 && <p className="text-sm text-slate-500 italic text-center py-4">Bu ülke için henüz soru eklenmemiş.</p>}

            </div>

          </div>

        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-700 flex justify-between items-center">

          {!country.isNew ? <button onClick={handleDelete} className="text-red-400 text-sm font-bold underline">Sil</button> : <div/>}

          <div className="flex gap-2"><button onClick={onClose} className="bg-slate-700 text-white px-6 py-2.5 rounded-lg">İptal</button><button onClick={handleSave} disabled={saving} className="bg-green-600 text-white px-8 py-2.5 rounded-lg font-bold flex items-center gap-2"><Check className="w-5 h-5"/> Kaydet</button></div>

        </div>

      </div>

    </div>

  );

}



// --- Gün Sonu Rapor Çıktısı Modalı ---

function PrintableEODReportModal({ date, entries, settings, onClose }) {

  return (

    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md overflow-y-auto print:bg-white print:items-start p-4">

      <div id="printable-visa" className="bg-white text-slate-900 w-[800px] max-w-full rounded-xl shadow-2xl relative overflow-hidden border border-slate-300 print:shadow-none print:border-none print:w-[21cm] print:p-0">

        <div className="p-8 border-b border-slate-200 flex justify-between items-end">

          <div>

            <h2 className="text-3xl font-black text-slate-800 tracking-widest uppercase">{settings?.hostCountryName || 'Sistem'} GÖÇ İDARESİ</h2>

            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">GÜN SONU İŞLEM ÖZETİ</p>

          </div>

          <div className="text-right">

            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Rapor Tarihi</div>

            <div className="text-2xl font-mono font-bold text-indigo-600">{date}</div>

          </div>

        </div>

        <div className="p-8">

          <table className="w-full text-left text-sm border-collapse">

            <thead>

              <tr className="border-b-2 border-slate-800 text-slate-800">

                <th className="py-3 px-2 font-bold uppercase text-xs">Kişi Adı</th>

                <th className="py-3 px-2 font-bold uppercase text-xs">Uyruk / Geldiği Ülke</th>

                <th className="py-3 px-2 font-bold uppercase text-xs">Vize ID</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-200">

              {entries.map(e => (

                <tr key={e.id}>

                  <td className="py-3 px-2 font-bold uppercase">{e.travelerName}</td>

                  <td className="py-3 px-2 text-slate-600 font-medium">{e.countryName}</td>

                  <td className="py-3 px-2 font-mono font-bold text-slate-500">{e.visaId}</td>

                </tr>

              ))}

              {entries.length === 0 && <tr><td colSpan="3" className="py-4 text-center">Bu tarihte işlem kaydı yok.</td></tr>}

            </tbody>

          </table>

          <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 font-bold uppercase">

            <span className="bg-slate-100 px-3 py-1 rounded">Toplam İşlem: <span className="text-slate-800">{entries.length}</span></span>

            <span>Sistem Tarafından Otomatik Üretilmiştir</span>

          </div>

        </div>

      </div>

      <div className="absolute top-6 right-6 flex gap-3 no-print">

        <button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold shadow-2xl flex items-center gap-2 text-lg transition-all"><Printer className="w-5 h-5"/> Raporu Yazdır</button>

        <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-bold shadow-2xl transition-all">Kapat</button>

      </div>

    </div>

  );

}



function LogViewer({ entries, showToast, settings }) {

  const [selectedEntry, setSelectedEntry] = useState(null);

  const [eodReportData, setEodReportData] = useState(null);



  const handleDelete = async (id) => {

    try {

      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'entries', id));

      if(showToast) showToast('İşlem kaydı sistemden silindi.', 'info');

    } catch (err) {

      if(showToast) showToast('Silme işlemi başarısız oldu.', 'error');

    }

  };



  const getStatusColor = (s) => s === 'Onaylandı' ? 'text-green-400 bg-green-400/10 border-green-400/20' : s === 'Reddedildi' ? 'text-red-400 bg-red-400/10 border-red-400/20' : 'text-amber-400 bg-amber-400/10 border-amber-400/20';

  

  // İşlemleri günlere göre grupla

  const groupedEntries = entries.reduce((acc, entry) => {

    const dateStr = new Date(entry.timestamp).toLocaleDateString('tr-TR');

    if (!acc[dateStr]) acc[dateStr] = [];

    acc[dateStr].push(entry);

    return acc;

  }, {});



  // Tarihleri en yeniden en eskiye sırala

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => {

     const [d1, m1, y1] = a.split('.');

     const [d2, m2, y2] = b.split('.');

     return new Date(y2, m2-1, d2) - new Date(y1, m1-1, d1);

  });



  return (

    <div className="space-y-6">

      {eodReportData && <PrintableEODReportModal date={eodReportData.date} entries={eodReportData.entries} settings={settings} onClose={() => setEodReportData(null)} />}



      <div className="bg-slate-800 rounded-xl p-6 shadow-md border border-slate-700 flex justify-between items-center">

        <div><h2 className="text-xl font-bold text-white mb-1">İşlem Kayıtları (Günlük Özeti)</h2><p className="text-sm text-slate-400">Tüm mülakatlar ve kararlar tarihe göre gruplandırıldı.</p></div>

        <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center"><span className="text-2xl font-black text-indigo-400 block">{entries.length}</span><span className="text-[10px] text-slate-500 font-bold">TOPLAM KAYIT</span></div>

      </div>



      <div className="space-y-8">

        {sortedDates.map(date => (

          <div key={date} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-sm">

            <div className="bg-slate-900/80 px-5 py-4 border-b border-slate-700 flex justify-between items-center">

              <h3 className="font-bold text-white text-lg flex items-center gap-2">

                <FileText className="w-5 h-5 text-indigo-400"/> {date} 

                <span className="text-sm text-slate-400 font-normal ml-2">({groupedEntries[date].length} İşlem)</span>

              </h3>

              <button onClick={() => setEodReportData({ date, entries: groupedEntries[date] })} className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg font-bold transition-colors text-xs flex items-center gap-2 shadow-sm">

                <Printer className="w-4 h-4"/> Gün Sonu Çıktısı Al

              </button>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm text-slate-300">

                <thead className="text-xs text-slate-400 uppercase bg-slate-900/40 border-b border-slate-700">

                  <tr><th className="px-5 py-3 font-bold">Saat</th><th className="px-5 py-3 font-bold">Memur</th><th className="px-5 py-3 font-bold">Yolcu / Vize</th><th className="px-5 py-3 font-bold">Karar</th><th className="px-5 py-3 font-bold text-right">İşlemler</th></tr>

                </thead>

                <tbody className="divide-y divide-slate-700/50">

                  {groupedEntries[date].map(e => (

                    <tr key={e.id} className="hover:bg-slate-700/30 transition-colors">

                      <td className="px-5 py-3 text-xs text-slate-400 font-mono">{new Date(e.timestamp).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}</td>

                      <td className="px-5 py-3 font-medium text-blue-300"><Shield className="w-4 h-4 inline mr-1"/>{e.policeName}</td>

                      <td className="px-5 py-3"><div className="font-bold text-white">{e.travelerName}</div><div className="text-xs text-slate-500 font-mono">{e.visaId}</div></td>

                      <td className="px-5 py-3"><span className={`px-3 py-1 rounded-full text-[11px] font-black border ${getStatusColor(e.status)}`}>{e.status?.toUpperCase()}</span></td>

                      <td className="px-5 py-3 text-right flex justify-end gap-2">

                        <button onClick={() => setSelectedEntry(e)} className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>

                        <button onClick={() => handleDelete(e.id)} className="bg-red-500/20 text-red-400 hover:bg-red-600 hover:text-white p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        ))}

        {sortedDates.length === 0 && <div className="text-center py-10 text-slate-500 bg-slate-800 rounded-xl border border-slate-700">Sistemde işlem kaydı bulunmuyor.</div>}

      </div>



      {selectedEntry && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in-up no-print">

          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-600">

            <div className="p-6 border-b border-slate-700 flex justify-between bg-slate-900/80">

              <div><h3 className="text-xl font-black text-white">Mülakat Tutanağı</h3><p className="text-xs text-slate-400">ID: {selectedEntry.id}</p></div>

              <button onClick={() => setSelectedEntry(null)} className="text-slate-400 hover:text-white"><XCircle className="w-6 h-6"/></button>

            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">

              <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-900 p-5 rounded-xl border border-slate-700">

                <div><span className="text-slate-500 text-[10px] uppercase font-bold">Memur</span><div className="font-bold text-blue-400">{selectedEntry.policeName}</div></div>

                <div><span className="text-slate-500 text-[10px] uppercase font-bold">Yolcu</span><div className="font-bold text-white">{selectedEntry.travelerName}</div></div>

                <div><span className="text-slate-500 text-[10px] uppercase font-bold">Pasaport</span><div className="font-mono text-slate-300">{selectedEntry.passportNo}</div></div>

                <div><span className="text-slate-500 text-[10px] uppercase font-bold">Karar</span><div className={`font-black ${getStatusColor(selectedEntry.status).split(' ')[0]}`}>{selectedEntry.status}</div></div>

              </div>

              <h4 className="font-black text-indigo-400 mb-4 flex items-center gap-2 border-b border-slate-700 pb-2"><FileText className="w-4 h-4" /> Sorgu Kayıtları</h4>

              {selectedEntry.answers?.length > 0 ? (

                <div className="space-y-4">

                  {selectedEntry.answers.map((qa, idx) => (

                    <div key={idx} className="bg-slate-800 p-4 rounded-lg border border-slate-700 border-l-4 border-l-indigo-500">

                      <p className="text-sm font-medium text-slate-300 mb-2">S: {qa.question}</p>

                      <div className="bg-slate-900/50 p-2 rounded"><p className="text-sm text-white"><span className="text-emerald-400 font-bold mr-2">C:</span>{qa.answer || 'Cevapsız'}</p></div>

                    </div>

                  ))}

                </div>

              ) : <div className="text-slate-500 text-center py-6 text-sm">Soru sorulmadı.</div>}

            </div>

          </div>

        </div>

      )}

    </div>

  );

}



function UserManagement({ policeUsers, showToast }) {

  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({ username: '', password: '', name: '', rank: 'Memur', permissions: ['border'] });



  const togglePerm = (permId) => setFormData({...formData, permissions: formData.permissions.includes(permId) ? formData.permissions.filter(p => p !== permId) : [...formData.permissions, permId]});

  

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (policeUsers.some(u => u.username === formData.username)) return showToast('Bu kullanıcı adı mevcut!', 'error');

    try {

      await addDoc(getCollectionRef('police_users'), { ...formData, createdAt: Date.now() });

      showToast('Personel yetkilendirildi.', 'success'); setIsAdding(false);

    } catch (err) { showToast('Ekleme hatası.', 'error'); }

  };

  

  return (

    <div className="space-y-6">

      <div className="flex justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">

        <div><h2 className="text-xl font-bold text-white">Personel Yönetimi</h2></div>

        <button onClick={() => setIsAdding(!isAdding)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><UserPlus className="w-4 h-4"/> Ekle</button>

      </div>

      {isAdding && (

        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">

          <div className="grid grid-cols-4 gap-4">

             <div><label className="text-sm text-slate-400">Rütbe</label><select value={formData.rank} onChange={e => setFormData({...formData, rank: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"><option>Memur</option><option>Amir</option></select></div>

             <div><label className="text-sm text-slate-400">Ad Soyad</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" /></div>

             <div><label className="text-sm text-slate-400">Kullanıcı Adı</label><input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" /></div>

             <div><label className="text-sm text-slate-400">Şifre</label><input required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" /></div>

          </div>

          <div className="bg-slate-900 p-4 rounded border border-slate-700">

            <label className="text-indigo-400 font-bold block mb-2">Yetkiler</label>

            <div className="flex gap-4">

              {[{id:'border', l:'Sınır'},{id:'visas', l:'Vize'},{id:'countries', l:'Ülke'},{id:'logs', l:'Log'}].map(p => (

                <label key={p.id} className="flex gap-2 items-center text-white"><input type="checkbox" checked={formData.permissions.includes(p.id)} onChange={()=>togglePerm(p.id)} className="accent-indigo-500" />{p.l}</label>

              ))}

            </div>

          </div>

          <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg">Kaydet</button>

        </form>

      )}

      <div className="grid grid-cols-3 gap-4">

        {policeUsers.map(u => (

          <div key={u.id} className="bg-slate-800 p-4 rounded border border-slate-700 flex justify-between">

            <div><h3 className="font-bold text-white">{u.rank} {u.name}</h3><p className="text-xs text-slate-400">ID: {u.username} | Şifre: {u.password}</p></div>

            <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'police_users', u.id))} className="text-red-400"><XCircle className="w-5 h-5"/></button>

          </div>

        ))}

      </div>

    </div>

  );

}
