import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  UserPlus, 
  Upload, 
  LayoutDashboard, 
  UserCheck, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Users,
  FileUp,
  RefreshCw,
  AlertTriangle,
  Trash2,
  ChevronRight,
  RotateCcw,
  Menu, // Icon baru untuk Navbar
  X     // Icon baru untuk Navbar
} from 'lucide-react';

// --- KONFIGURASI API ---
// Menggunakan env tapi default ke 5000 (sesuai kode lama/flask)
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

// --- KOMPONEN UTILITAS ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 justify-center";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 border-transparent",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 border-transparent",
    danger: "bg-red-500 text-white hover:bg-red-600 border-transparent",
    success: "bg-green-600 text-white hover:bg-green-700 border-transparent"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold mt-1 text-gray-800">{value}</h3>
    </div>
    <div className={`p-4 rounded-full ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---
export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [serverStatus, setServerStatus] = useState(true);
  
  // State khusus Navbar Baru (Mobile)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load logs dari LocalStorage
  useEffect(() => {
    const savedLogs = localStorage.getItem('deepface_logs');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  // Simpan logs ke LocalStorage
  useEffect(() => {
    localStorage.setItem('deepface_logs', JSON.stringify(logs));
  }, [logs]);

  const handleAttendanceLog = (log) => {
    setLogs(prev => [log, ...prev]);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard logs={logs} />;
      case 'attendance': return <AttendancePage onAttendance={handleAttendanceLog} setServerStatus={setServerStatus} />;
      case 'register': return <RegisterPage />; // Menggunakan RegisterPage Komples (Lama)
      case 'upload': return <UploadDatasetPage />; // Menggunakan UploadPage Komples (Lama)
      default: return <Dashboard logs={logs} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans text-gray-900 overflow-hidden">
      
      {/* --- SIDEBAR DESKTOP (TAMPILAN BARU) --- */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col flex-shrink-0 z-20">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <Activity /> DeepFace
          </h1>
          <p className="text-xs text-gray-500 mt-1">Sistem Absensi Cerdas</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} icon={LayoutDashboard} label="Dashboard" />
          <NavItem active={activePage === 'attendance'} onClick={() => setActivePage('attendance')} icon={UserCheck} label="Absensi Online" />
          <NavItem active={activePage === 'register'} onClick={() => setActivePage('register')} icon={UserPlus} label="Registrasi Wajah" />
          <NavItem active={activePage === 'upload'} onClick={() => setActivePage('upload')} icon={Upload} label="Upload Dataset" />
        </nav>
        <div className="p-4 border-t border-gray-100 text-xs text-gray-400 text-center">
          <div className={`inline-block w-2 h-2 rounded-full mr-2 ${serverStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
          Backend: {serverStatus ? 'Connected' : 'Disconnected'}
        </div>
      </aside>

      {/* --- MOBILE MENU OVERLAY (TAMPILAN BARU) --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* --- MOBILE SIDEBAR SLIDE-OUT (TAMPILAN BARU) --- */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex justify-between items-center border-b">
           <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">DeepFace</h1>
           <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
              <X size={20}/>
           </button>
        </div>
        <nav className="p-4 space-y-2">
          <NavItem active={activePage === 'dashboard'} onClick={() => { setActivePage('dashboard'); setIsMobileMenuOpen(false); }} icon={LayoutDashboard} label="Dashboard" />
          <NavItem active={activePage === 'attendance'} onClick={() => { setActivePage('attendance'); setIsMobileMenuOpen(false); }} icon={UserCheck} label="Absensi Online" />
          <NavItem active={activePage === 'register'} onClick={() => { setActivePage('register'); setIsMobileMenuOpen(false); }} icon={UserPlus} label="Registrasi Wajah" />
          <NavItem active={activePage === 'upload'} onClick={() => { setActivePage('upload'); setIsMobileMenuOpen(false); }} icon={Upload} label="Upload Dataset" />
        </nav>
      </div>

      {/* --- HEADER MOBILE (TAMPILAN BARU) --- */}
      <div className="md:hidden fixed top-0 w-full bg-white z-30 shadow-md h-16 px-4 flex justify-between items-center">
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
            <Menu size={24} />
        </button>
        <h1 className="font-bold text-blue-600 text-lg flex items-center gap-2">
            <Activity size={18}/> DeepFace
        </h1>
      </div>

      {/* --- KONTEN UTAMA --- */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 mt-16 md:mt-0 w-full bg-gray-50">
        {!serverStatus && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center gap-2 text-sm md:text-base" role="alert">
            <AlertTriangle size={20} className="flex-shrink-0"/>
            <div>
              <strong className="font-bold">Gagal Terhubung! </strong>
              <span className="block sm:inline">Pastikan backend berjalan (port 5000).</span>
            </div>
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
}

const NavItem = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors border-0 text-left ${
      active 
        ? 'bg-blue-50 text-blue-600 font-semibold' 
        : 'bg-white text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Icon size={20} />
    {label}
  </button>
);

// --- HALAMAN 1: DASHBOARD (VERSI LAMA - LEBIH LENGKAP) ---
const Dashboard = ({ logs }) => {
  const [totalRegistered, setTotalRegistered] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/stats`);
        if (!response.ok) throw new Error('Server not ready');
        const data = await response.json();
        if(data.status === 'success') setTotalRegistered(data.total_users);
      } catch (err) {
        console.warn("Server belum terhubung.");
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Utama</h2>
        <p className="text-gray-500 text-sm md:text-base">Monitoring real-time absensi mahasiswa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card title="Total Mahasiswa Terdaftar" value={totalRegistered} icon={Users} color="bg-blue-500" />
        <Card title="Total Absensi Masuk" value={logs.length} icon={CheckCircle} color="bg-green-500" />
        <Card title="Rata-rata Confidence" value={logs.length > 0 ? (logs.reduce((acc, curr) => acc + parseFloat(curr.confidence), 0) / logs.length).toFixed(1) + '%' : '0%'} icon={Activity} color="bg-purple-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">Log Aktivitas Terkini</h3>
          <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-500">Real-time</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="p-4 font-medium">Waktu</th>
                <th className="p-4 font-medium">Nama Mahasiswa</th>
                <th className="p-4 font-medium">NIM</th>
                <th className="p-4 font-medium">Model</th>
                <th className="p-4 font-medium">Confidence</th>
                <th className="p-4 font-medium">L2 Distance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {logs.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400 italic">Belum ada data absensi.</td></tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-600 whitespace-nowrap">{new Date(log.timestamp).toLocaleString('id-ID')}</td>
                    <td className="p-4 font-bold text-gray-800">{log.name}</td>
                    <td className="p-4 text-gray-600 font-mono">{log.nim}</td>
                    <td className="p-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium border border-blue-200">{log.model}</span></td>
                    <td className="p-4 text-green-600 font-bold">{log.confidence}</td>
                    <td className="p-4 text-gray-500 font-mono text-xs">{log.distance}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- HALAMAN 2: ATTENDANCE (VERSI LAMA - DETAIL LENGKAP) ---
const AttendancePage = ({ onAttendance, setServerStatus }) => {
  const videoRef = useRef(null);
  const [model, setModel] = useState('facenet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        alert("Gagal akses kamera: " + err);
      }
    };
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const handleDeepFaceCheck = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    setResult(null);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const imageBase64 = canvas.toDataURL('image/jpeg');

    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64, model: model })
      });
      setServerStatus(true);
      const data = await response.json();

      if (data.status === 'success') {
        const logData = { ...data.data, timestamp: new Date().toISOString() };
        setResult({ status: 'success', data: logData });
        onAttendance(logData);
      } else {
        setResult({ status: 'failed', message: data.message || "Wajah tidak dikenali." });
      }
    } catch (error) {
      setServerStatus(false);
      setResult({ status: 'failed', message: 'Gagal koneksi server.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Kolom Kamera */}
      <div className="lg:col-span-2 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Camera className="text-blue-500"/> Kamera Absensi</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Model:</span>
            <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full sm:w-auto bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="facenet">FaceNet</option>
              <option value="facenet512">FaceNet-512</option>
            </select>
          </div>
        </div>

        <div className="relative bg-black rounded-2xl overflow-hidden aspect-square sm:aspect-video shadow-lg border-4 border-white ring-1 ring-gray-200">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
          {isProcessing && (
            <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
              <RefreshCw className="w-12 h-12 animate-spin mb-4 text-blue-300" />
              <span className="animate-pulse font-semibold text-lg">Memproses...</span>
            </div>
          )}
        </div>

        <Button onClick={handleDeepFaceCheck} disabled={isProcessing} className="w-full py-4 text-lg shadow-md">
          {isProcessing ? 'Sedang Memproses...' : 'Scan Wajah Sekarang'}
        </Button>
      </div>

      {/* Kolom Hasil */}
      <div className="lg:col-span-1 min-h-[300px]">
        {result ? (
          <div className={`h-full rounded-2xl p-6 md:p-8 border-2 ${result.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} flex flex-col items-center text-center shadow-sm`}>
             {result.status === 'success' ? (
               <>
                 <div className="bg-green-100 p-6 rounded-full mb-6 ring-4 ring-green-50 shadow-inner">
                    <CheckCircle size={56} className="text-green-600" />
                 </div>
                 <h3 className="font-bold text-green-800 text-2xl mb-1">Berhasil</h3>
                 <div className="text-left w-full space-y-4 bg-white p-5 rounded-xl shadow-sm border border-green-100 mt-4">
                   <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-500">Nama</span>
                      <span className="font-bold text-gray-900">{result.data.name}</span>
                   </div>
                   <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-500">NIM</span>
                      <span className="font-mono text-gray-900 bg-gray-100 px-2 rounded text-sm">{result.data.nim}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Score</span>
                      <span className="text-green-600 font-bold bg-green-50 px-2 rounded">{result.data.confidence}</span>
                   </div>
                 </div>
               </>
             ) : (
               <>
                 <div className="bg-red-100 p-6 rounded-full mb-6 ring-4 ring-red-50 shadow-inner">
                    <XCircle size={56} className="text-red-600" />
                 </div>
                 <h3 className="font-bold text-red-800 text-2xl mb-2">Gagal</h3>
                 <p className="text-red-600 font-medium">{result.message}</p>
               </>
             )}
          </div>
        ) : (
          <div className="h-full bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 p-8 text-center min-h-[200px]">
            <UserCheck size={48} className="opacity-30 text-gray-600 mb-4" />
            <h4 className="text-gray-600 font-medium text-lg">Menunggu Scan</h4>
            <p className="text-sm mt-2 max-w-xs">Arahkan wajah ke kamera.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- HALAMAN 3: REGISTER (VERSI LAMA - 3 POSE MANUAL) ---
const RegisterPage = () => {
  const videoRef = useRef(null);
  const [nim, setNim] = useState('');
  const [name, setName] = useState('');
  
  const [step, setStep] = useState(0); 
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // STEP WIZARD MANUAL
  const STEPS = [
    { label: "Isi Data", instruction: "Lengkapi identitas" },
    { label: "Wajah Depan", instruction: "Hadap lurus ke kamera" },
    { label: "Wajah Kiri", instruction: "Putar kepala sedikit ke kiri" },
    { label: "Wajah Kanan", instruction: "Putar kepala sedikit ke kanan" },
    { label: "Selesai", instruction: "Review dan Simpan" }
  ];

  // Aktifkan Kamera saat Step 1-3
  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      if (step >= 1 && step <= 3) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch(err) { console.error("Gagal akses kamera", err); }
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [step]); 

  // FUNGSI CAPTURE MANUAL
  const capture = () => {
    if (step >= 4) return;
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);

    setPhotos(prev => [...prev, imageBase64]);
    setStep(prev => prev + 1);
  };

  const handleReset = () => {
    setStep(0);
    setPhotos([]);
    setNim('');
    setName('');
    setShowSuccessModal(false); 
  };

  const handleRegister = async () => {
    setIsUploading(true);
    try {
      const payload = { nim: nim, name: name, images: photos };
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setShowSuccessModal(true);
      } else {
        alert("ERROR: " + (data.message || "Error server"));
      }
    } catch (err) {
      alert("Gagal koneksi ke server Python.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative px-2 md:px-0">
      {/* --- POP-UP MODAL SUKSES --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Registrasi Berhasil!</h3>
            <p className="text-gray-500 mb-6">
                Data wajah <strong>{name}</strong> berhasil tersimpan.
            </p>
            <Button onClick={handleReset} className="w-full py-3 justify-center text-lg">Oke, Selesai</Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Registrasi Wajah (Manual)</h2>
        <p className="text-gray-500 mb-6">{STEPS[step]?.instruction}</p>
        <div className="flex justify-center items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-2 w-16 rounded-full transition-all duration-300 ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>
      
      {/* STEP 0: Form Input */}
      {step === 0 && (
        <div className="max-w-md mx-auto bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
           <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">NIM Mahasiswa</label>
              <input type="text" required value={nim} onChange={e => setNim(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg" placeholder="Contoh: 21000123" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Nama Lengkap</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg" placeholder="Nama sesuai KTM" />
            </div>
            <Button onClick={() => { if(nim && name) setStep(1); else alert("Mohon lengkapi data"); }} className="w-full py-3 mt-4 justify-center">
              Mulai Foto Wajah
            </Button>
        </div>
      )}

      {/* STEP 1-3: Camera (Manual Capture) */}
      {step >= 1 && step <= 3 && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-square sm:aspect-video shadow-2xl border-4 border-white ring-1 ring-gray-200">
             <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
             
             {/* Overlay Text */}
             <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 px-4 py-1 rounded-full text-white text-sm font-medium border border-white/20">
               {STEPS[step].label}
             </div>
          </div>

          <div className="flex justify-center">
             <button 
               onClick={capture} 
               className="bg-white border-4 border-blue-500 rounded-full w-20 h-20 flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
             >
               <div className="w-16 h-16 bg-blue-500 rounded-full"></div>
             </button>
          </div>
          
          <div className="flex justify-center gap-2 md:gap-4 mt-4">
             {photos.map((img, idx) => (
               <img key={idx} src={img} className="w-16 h-12 md:w-20 md:h-16 object-cover rounded-lg border-2 border-blue-500 shadow-md transform scale-x-[-1]" alt="thumb" />
             ))}
             {[...Array(3 - photos.length)].map((_, idx) => (
                <div key={idx} className="w-16 h-12 md:w-20 md:h-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"><span className="text-xs text-gray-400">{idx + 1 + photos.length}</span></div>
             ))}
          </div>
        </div>
      )}

      {/* STEP 4: Review & Upload */}
      {step === 4 && (
        <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm text-center animate-fade-in">
           <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="text-blue-600" size={32} /></div>
           <h3 className="text-xl font-bold text-gray-800 mb-2">Selesai</h3>
           <p className="text-gray-500 mb-6">Wajah berhasil diambil dari 3 sudut. Silakan simpan.</p>
           <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
              {photos.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img} className="w-full h-24 md:h-32 object-cover rounded-lg shadow-sm border border-gray-200 transform scale-x-[-1]" alt={`pose ${idx}`} />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] md:text-xs px-2 py-1 rounded">{idx === 0 ? 'Depan' : idx === 1 ? 'Kiri' : 'Kanan'}</div>
                </div>
              ))}
           </div>
           <div className="flex gap-4">
             <Button variant="secondary" onClick={handleReset} className="flex-1 py-3 justify-center"><RotateCcw size={16} className="mr-2"/> Ulangi</Button>
             <Button onClick={handleRegister} disabled={isUploading} className="flex-[2] py-3 justify-center">{isUploading ? 'Menyimpan Data...' : 'Simpan'} <Upload size={16} className="ml-2"/></Button>
           </div>
        </div>
      )}
    </div>
  );
};

// --- HALAMAN 4: UPLOAD DATASET (VERSI LAMA - MULTIPLE PREVIEW) ---
const UploadDatasetPage = () => {
  const [nim, setNim] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
      selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setPreviews(prev => [...prev, reader.result]);
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0 || !nim) return alert("Isi NIM dan pilih minimal satu foto!");
    setUploading(true);

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    try {
        const base64Images = await Promise.all(files.map(file => toBase64(file)));
        const response = await fetch(`${API_URL}/upload-dataset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nim, images: base64Images })
        });
        const data = await response.json();
        
        if(data.status === 'success') {
          alert(`Berhasil! ${data.message}`);
          setPreviews([]); setFiles([]); setNim('');
        } else {
          alert("GAGAL: " + (data.message || "Error tidak diketahui"));
        }
    } catch(err) {
        alert("Gagal koneksi server.");
    } finally {
        setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Upload Dataset (Multiple)</h2>
        <p className="text-gray-500 text-sm mb-8">Hanya bisa upload untuk NIM yang sudah terdaftar via Registrasi.</p>
        
        <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Masukkan NIM</label>
              <input type="text" value={nim} onChange={e => setNim(e.target.value)} placeholder="Contoh: 21001" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="border-2 border-dashed border-gray-300 p-10 text-center rounded-2xl hover:bg-gray-50 transition relative group cursor-pointer">
                <input type="file" onChange={handleFileChange} accept="image/*" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="text-gray-400 flex flex-col items-center group-hover:text-blue-500 transition-colors pointer-events-none">
                  <div className="bg-gray-100 p-4 rounded-full mb-3 group-hover:bg-blue-50 transition-colors"><FileUp size={40}/></div>
                  <p className="font-medium text-gray-600">Klik atau geser banyak foto ke sini</p>
                </div>
            </div>

            {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {previews.map((src, idx) => (
                        <div key={idx} className="relative group">
                            <img src={src} className="w-full h-24 object-cover rounded-lg border border-gray-200" alt="preview" />
                            <button onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-transform hover:scale-110">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Button onClick={handleUpload} disabled={uploading || files.length === 0} className="w-full py-3">
                {uploading ? `Mengupload ${files.length} Foto...` : `Upload ${files.length} Foto`}
            </Button>
        </div>
    </div>
  );
};