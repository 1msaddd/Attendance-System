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
  Menu,
  X
} from 'lucide-react';

// --- KONFIGURASI API ---
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:7860";

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
      case 'register': return <RegisterPage />;
      case 'upload': return <UploadDatasetPage />;
      default: return <Dashboard logs={logs} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans text-gray-900 overflow-hidden">
      
      {/* Sidebar Desktop */}
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Mobile Sidebar (Slide-out) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex justify-between items-center border-b">
           <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">DeepFace</h1>
           
           {/* CLOSE BUTTON (Updated to match Burger Button) */}
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

      {/* Header Mobile */}
      <div className="md:hidden fixed top-0 w-full bg-white z-30 shadow-md h-16 px-4 flex justify-between items-center">
        {/* Burger Button (Blue Box) */}
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
            <Menu size={24} />
        </button>

        {/* Logo */}
        <h1 className="font-bold text-blue-600 text-lg flex items-center gap-2">
            <Activity size={18}/> DeepFace
        </h1>
      </div>

      {/* Konten Utama */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 mt-16 md:mt-0 w-full bg-gray-50">
        {!serverStatus && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center gap-2 text-sm md:text-base" role="alert">
            <AlertTriangle size={20} className="flex-shrink-0"/>
            <div>
              <strong className="font-bold">Gagal Terhubung! </strong>
              <span className="block sm:inline">Pastikan backend berjalan.</span>
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

// --- HALAMAN 1: DASHBOARD ---
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
        <Card title="Total Mahasiswa" value={totalRegistered} icon={Users} color="bg-blue-500" />
        <Card title="Total Absensi" value={logs.length} icon={CheckCircle} color="bg-green-500" />
        <Card title="Avg Confidence" value={logs.length > 0 ? (logs.reduce((acc, curr) => acc + parseFloat(curr.confidence), 0) / logs.length).toFixed(1) + '%' : '0%'} icon={Activity} color="bg-purple-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">Log Aktivitas</h3>
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
                <th className="p-4 font-medium">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {logs.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">Belum ada data absensi.</td></tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-600 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString('id-ID')}</td>
                    <td className="p-4 font-bold text-gray-800">{log.name}</td>
                    <td className="p-4 text-gray-600 font-mono">{log.nim}</td>
                    <td className="p-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">{log.model}</span></td>
                    <td className="p-4 text-green-600 font-bold">{log.confidence}</td>
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

// --- HALAMAN 2: ATTENDANCE (ABSENSI) ---
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
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Camera className="text-blue-500"/> Kamera</h2>
          <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full sm:w-auto bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="facenet">FaceNet</option>
            <option value="facenet512">FaceNet-512</option>
          </select>
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

      {/* Kolom Hasil (Responsive) */}
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

// --- HALAMAN 3: REGISTER ---
const RegisterPage = () => {
  const videoRef = useRef(null);
  const [nim, setNim] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState(0); 
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const STEPS = [
    { label: "Data", instruction: "Isi data" },
    { label: "Depan", instruction: "Hadap Depan" },
    { label: "Kiri", instruction: "Hadap Kiri" },
    { label: "Kanan", instruction: "Hadap Kanan" },
    { label: "Selesai", instruction: "Simpan" }
  ];

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      if (step >= 1 && step <= 3) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch(err) { console.error(err); }
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [step]); 

  const capture = () => {
    if (step >= 4 || !videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    setPhotos(prev => [...prev, canvas.toDataURL('image/jpeg', 0.9)]);
    setStep(prev => prev + 1);
  };

  const handleRegister = async () => {
    setIsUploading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim, name, images: photos })
      });
      const data = await response.json();
      if (data.status === 'success') setShowSuccessModal(true);
      else alert("Error: " + data.message);
    } catch (err) { alert("Gagal koneksi ke server."); }
    finally { setIsUploading(false); }
  };

  const reset = () => { setStep(0); setPhotos([]); setNim(''); setName(''); setShowSuccessModal(false); };

  return (
    <div className="max-w-4xl mx-auto relative px-2 md:px-0">
      {/* Modal Sukses */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <CheckCircle className="text-green-600 w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Registrasi Berhasil!</h3>
            <Button onClick={reset} className="w-full mt-4">Selesai</Button>
          </div>
        </div>
      )}

      {/* Header Wizard */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">Registrasi Wajah</h2>
        <p className="text-gray-500 mb-4">{STEPS[step]?.instruction}</p>
        <div className="flex justify-center gap-1">
          {[0, 1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1 w-8 md:w-16 rounded-full transition-all ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>
      
      {/* STEP 0: Form */}
      {step === 0 && (
        <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
           <input type="text" value={nim} onChange={e => setNim(e.target.value)} className="w-full border p-3 rounded-lg" placeholder="NIM" />
           <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border p-3 rounded-lg" placeholder="Nama Lengkap" />
           <Button onClick={() => { if(nim && name) setStep(1); }} className="w-full py-3">Lanjut</Button>
        </div>
      )}

      {/* STEP 1-3: Camera */}
      {step >= 1 && step <= 3 && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-square sm:aspect-video shadow-lg">
             <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
             <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full text-white text-xs">
               {STEPS[step].label}
             </div>
          </div>
          <div className="flex justify-center">
             <button onClick={capture} className="bg-white border-4 border-blue-500 rounded-full w-16 h-16 shadow-lg flex items-center justify-center">
               <div className="w-12 h-12 bg-blue-500 rounded-full"></div>
             </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review */}
      {step === 4 && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm text-center">
           <div className="grid grid-cols-3 gap-2 mb-6">
              {photos.map((img, idx) => (
                <img key={idx} src={img} className="w-full h-24 object-cover rounded-lg transform scale-x-[-1]" alt="thumb" />
              ))}
           </div>
           <div className="flex gap-3">
             <Button variant="secondary" onClick={reset} className="flex-1">Ulangi</Button>
             <Button onClick={handleRegister} disabled={isUploading} className="flex-[2]">{isUploading ? 'Menyimpan...' : 'Simpan'}</Button>
           </div>
        </div>
      )}
    </div>
  );
};

// --- HALAMAN 4: UPLOAD (Simple) ---
const UploadDatasetPage = () => {
  const [nim, setNim] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (files.length === 0 || !nim) return alert("Lengkapi data!");
    setUploading(true);
    
    // Helper convert file to Base64
    const toBase64 = file => new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
    });

    try {
        const base64Images = await Promise.all(Array.from(files).map(toBase64));
        const res = await fetch(`${API_URL}/upload-dataset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nim, images: base64Images })
        });
        const data = await res.json();
        if(data.status === 'success') { alert("Berhasil!"); setFiles([]); setNim(''); }
        else alert("Gagal: " + data.message);
    } catch(err) { alert("Error koneksi"); } 
    finally { setUploading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold mb-4">Upload Dataset</h2>
        <input type="text" value={nim} onChange={e => setNim(e.target.value)} placeholder="NIM" className="w-full border p-3 rounded-lg mb-4" />
        <div className="border-2 border-dashed border-gray-300 p-8 text-center rounded-xl mb-4">
            <input type="file" onChange={e => setFiles(e.target.files)} multiple className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
        </div>
        <Button onClick={handleUpload} disabled={uploading} className="w-full py-3">{uploading ? 'Mengupload...' : 'Upload Foto'}</Button>
    </div>
  );
};