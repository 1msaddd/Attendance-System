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
  Trash2
} from 'lucide-react';

// --- KONFIGURASI API ---
// Pastikan ini sesuai dengan terminal backend Python Anda (biasanya port 5000)
const API_URL = "http://127.0.0.1:5000"; 

// --- KOMPONEN UTILITAS (Tombol & Kartu) ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  // Base style dengan Flexbox untuk icon alignment
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 justify-center";
  
  // Variant warna menggunakan Tailwind
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 border-transparent",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 border-transparent",
    danger: "bg-red-500 text-white hover:bg-red-600 border-transparent",
    success: "bg-green-600 text-white hover:bg-green-700 border-transparent"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
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
  const [serverStatus, setServerStatus] = useState(true); // Indikator koneksi ke Python

  // Load data logs dari LocalStorage saat pertama kali buka
  useEffect(() => {
    const savedLogs = localStorage.getItem('deepface_logs');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  // Simpan data logs ke LocalStorage setiap ada perubahan
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
      {/* Sidebar Navigasi */}
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
          Backend Python: {serverStatus ? 'Connected' : 'Disconnected'}
        </div>
      </aside>

      {/* Header Mobile */}
      <div className="md:hidden fixed top-0 w-full bg-white z-50 border-b p-4 flex justify-between items-center shadow-sm">
        <h1 className="font-bold text-blue-600 flex items-center gap-2"><Activity size={18}/> DeepFace</h1>
        <button onClick={() => setActivePage('dashboard')} className="p-2"><LayoutDashboard /></button>
      </div>

      {/* Konten Utama */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 mt-14 md:mt-0 w-full bg-gray-50">
        {!serverStatus && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center gap-2" role="alert">
            <AlertTriangle size={20}/>
            <div>
              <strong className="font-bold">Gagal Terhubung! </strong>
              <span className="block sm:inline">Pastikan file `server.py` sudah dijalankan di terminal backend.</span>
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

  // LOGIKA BARU: Fetch total user terdaftar dari Backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/stats`);
        if (!response.ok) throw new Error('Server not ready');
        const data = await response.json();
        if(data.status === 'success') setTotalRegistered(data.total_users);
      } catch (err) {
        console.warn("Server belum terhubung, menampilkan data offline sementara.");
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Utama</h2>
        <p className="text-gray-500">Monitoring real-time absensi mahasiswa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KARTU 1: UPDATE MENGGUNAKAN DATA LIVE DARI SERVER */}
        <Card title="Total Mahasiswa Terdaftar" value={totalRegistered} icon={Users} color="bg-blue-500" />
        
        {/* KARTU 2: UPDATE MENGGUNAKAN DATA LOG LOCALSTORAGE */}
        <Card title="Total Absensi Masuk" value={logs.length} icon={CheckCircle} color="bg-green-500" />
        
        <Card title="Rata-rata Confidence" value={logs.length > 0 ? (logs.reduce((acc, curr) => acc + parseFloat(curr.confidence), 0) / logs.length).toFixed(1) + '%' : '0%'} icon={Activity} color="bg-purple-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">Log Aktivitas Terkini</h3>
          <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-500">Real-time</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
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
                <tr><td colSpan="6" className="p-8 text-center text-gray-400 italic">Belum ada data absensi yang terekam.</td></tr>
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

// --- HALAMAN 2: ATTENDANCE (ABSENSI) ---
const AttendancePage = ({ onAttendance, setServerStatus }) => {
  const videoRef = useRef(null);
  const [model, setModel] = useState('facenet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  // Nyalakan Kamera saat halaman dibuka
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
      
    // Cleanup saat pindah halaman
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

    // 1. Ambil Gambar dari Video (Screenshot Canvas)
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const imageBase64 = canvas.toDataURL('image/jpeg');

    try {
      // 2. Kirim ke Server Python (Endpoint: /verify)
      const response = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64, model: model })
      });

      // Cek koneksi
      if (!response.ok) throw new Error('Network response was not ok');
      setServerStatus(true);
      
      const data = await response.json();

      if (data.status === 'success') {
        const logData = {
          ...data.data,
          timestamp: new Date().toISOString()
        };
        setResult({ status: 'success', data: logData });
        onAttendance(logData); // Simpan ke Log Dashboard
      } else {
        setResult({ status: 'failed', message: data.message || "Wajah tidak dikenali atau error tidak diketahui." });
      }

    } catch (error) {
      console.error(error);
      setServerStatus(false);
      setResult({ status: 'failed', message: 'Gagal terhubung ke Server Python DeepFace.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Camera className="text-blue-500"/> Kamera Absensi</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">Model DeepFace:</span>
            <select 
              value={model} 
              onChange={(e) => setModel(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="facenet">FaceNet (Google)</option>
              <option value="facenet512">FaceNet-512 (DeepFace)</option>
            </select>
          </div>
        </div>

        <div className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-lg border-4 border-white ring-1 ring-gray-200">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
          
          {/* Loading Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
              <RefreshCw className="w-12 h-12 animate-spin mb-4 text-blue-300" />
              <span className="animate-pulse font-semibold text-lg">Memproses Wajah...</span>
              <span className="text-sm text-blue-200 mt-2">Menggunakan model {model}</span>
            </div>
          )}
        </div>

        <Button onClick={handleDeepFaceCheck} disabled={isProcessing} className="w-full py-4 text-lg shadow-md shadow-blue-100">
          {isProcessing ? 'Sedang Memproses...' : 'Scan Wajah Sekarang'}
        </Button>
      </div>

      {/* Panel Hasil */}
      <div className="lg:col-span-1 h-full">
        {result ? (
          <div className={`h-full rounded-2xl p-8 border-2 ${result.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} flex flex-col items-center text-center animate-fade-in transition-all duration-300 shadow-sm`}>
             {result.status === 'success' ? (
               <>
                 <div className="bg-green-100 p-6 rounded-full mb-6 ring-4 ring-green-50 shadow-inner">
                    <CheckCircle size={56} className="text-green-600" />
                 </div>
                 <h3 className="font-bold text-green-800 text-2xl mb-1">Berhasil</h3>
                 <p className="text-green-600 text-sm mb-6 font-medium bg-green-100 px-3 py-1 rounded-full">Identitas Terverifikasi</p>
                 
                 <div className="text-left w-full space-y-4 bg-white p-5 rounded-xl shadow-sm border border-green-100">
                   <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-sm text-gray-500">Nama Lengkap</span>
                      <span className="font-bold text-gray-900 text-right">{result.data.name}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-sm text-gray-500">NIM</span>
                      <span className="font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-sm">{result.data.nim}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Confidence</span>
                      <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">{result.data.confidence}</span>
                   </div>
                   <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed border-gray-200">
                      <span className="text-xs text-gray-400">L2 Distance (Lower is better)</span>
                      <span className="text-xs text-gray-600 font-mono">{result.data.distance}</span>
                   </div>
                 </div>
               </>
             ) : (
               <>
                 <div className="bg-red-100 p-6 rounded-full mb-6 ring-4 ring-red-50 shadow-inner">
                    <XCircle size={56} className="text-red-600" />
                 </div>
                 <h3 className="font-bold text-red-800 text-2xl mb-2">Gagal</h3>
                 <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm w-full mt-2">
                    <p className="text-red-600 font-medium">{result.message}</p>
                 </div>
                 <p className="text-xs text-gray-400 mt-6 max-w-xs">
                   Tips: Pastikan wajah terlihat jelas, tidak terhalang masker/kacamata hitam, dan pencahayaan cukup.
                 </p>
               </>
             )}
          </div>
        ) : (
          <div className="h-full bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 p-8 text-center hover:border-blue-200 transition-colors">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
               <UserCheck size={48} className="opacity-30 text-gray-600" />
            </div>
            <h4 className="text-gray-600 font-medium text-lg">Menunggu Scan</h4>
            <p className="text-sm mt-2 max-w-xs">Arahkan wajah ke kamera dan klik tombol scan. Hasil detail absensi akan muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- HALAMAN 3: REGISTER (DAFTAR WAJAH) ---
const RegisterPage = () => {
  const videoRef = useRef(null);
  const [nim, setNim] = useState('');
  const [name, setName] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch(err) {
            console.error(err);
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

  const capture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    setCapturedImage(canvas.toDataURL('image/jpeg'));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!capturedImage) return;
    setIsUploading(true);

    try {
      // Kirim ke Backend Python
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim, name, image: capturedImage })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        alert(`SUKSES: ${data.message}`);
        setNim(''); setName(''); setCapturedImage(null);
      } else {
        const errorMsg = data.message || JSON.stringify(data) || "Terjadi kesalahan yang tidak diketahui pada server.";
        alert("ERROR: " + errorMsg);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal koneksi ke server Python. Pastikan terminal 'server.py' berjalan dan tidak ada error.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Registrasi Mahasiswa Baru</h2>
            <p className="text-gray-500">Daftarkan wajah mahasiswa ke database untuk keperluan absensi.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Kolom Form */}
        <div className="space-y-6">
          <form onSubmit={handleRegister} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">NIM Mahasiswa</label>
              <input 
                type="text" required value={nim} 
                onChange={e => setNim(e.target.value)} 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                placeholder="Contoh: 21000123" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Nama Lengkap</label>
              <input 
                type="text" required value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                placeholder="Nama sesuai KTM" 
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 border border-blue-100">
               <div className="flex gap-2">
                   <AlertTriangle size={16} className="flex-shrink-0 mt-0.5"/>
                   <p><strong>Penting:</strong> Foto yang diambil akan disimpan sebagai <strong>Anchor</strong>. Pastikan wajah terlihat jelas tanpa aksesoris berlebih.</p>
               </div>
            </div>

            <Button disabled={!capturedImage || isUploading} className="w-full py-3 mt-2">
              {isUploading ? 'Sedang Mengirim Data...' : 'Simpan Data & Foto'}
            </Button>
          </form>
        </div>

        {/* Kolom Kamera */}
        <div className="space-y-4">
            <div className="bg-black rounded-2xl overflow-hidden relative aspect-video flex items-center shadow-lg border-4 border-white ring-1 ring-gray-200">
            {!capturedImage ? (
                <video ref={videoRef} autoPlay muted playsInline className="w-full transform scale-x-[-1]" />
            ) : (
                <div className="relative w-full h-full">
                    <img src={capturedImage} className="w-full h-full object-cover transform scale-x-[-1]" alt="Captured" />
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-sm flex items-center gap-1">
                        <CheckCircle size={12}/> Siap Upload
                    </div>
                </div>
            )}
            
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
                {!capturedImage ? (
                    <button onClick={capture} className="bg-white hover:bg-gray-100 text-black px-6 py-2.5 rounded-full font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
                        <Camera size={18}/> Ambil Foto
                    </button>
                ) : (
                    <button onClick={() => setCapturedImage(null)} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
                        <RefreshCw size={18}/> Foto Ulang
                    </button>
                )}
            </div>
            </div>
            <p className="text-center text-sm text-gray-500">Pastikan pencahayaan ruangan cukup terang.</p>
        </div>
      </div>
    </div>
  );
};

// --- HALAMAN 4: UPLOAD DATASET (MULTIPLE - FITUR BARU) ---
const UploadDatasetPage = () => {
  const [nim, setNim] = useState('');
  const [files, setFiles] = useState([]); // List File
  const [previews, setPreviews] = useState([]); // List Preview URL
  const [uploading, setUploading] = useState(false);

  // Handle pilih banyak file
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);

      // Buat preview untuk setiap file
      selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviews(prev => [...prev, reader.result]);
        };
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

    // Helper convert file -> base64
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    try {
        // Konversi semua foto ke Base64 secara paralel
        const base64Images = await Promise.all(files.map(file => toBase64(file)));

        // Kirim ke endpoint baru yang support list
        const response = await fetch(`${API_URL}/upload-dataset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nim: nim, 
                images: base64Images // Kirim array images
            })
        });

        const data = await response.json();
        if(data.status === 'success') {
          alert(`Berhasil! ${data.message}`);
          setPreviews([]); setFiles([]); setNim('');
        } else {
          alert("Gagal: " + (data.message || JSON.stringify(data)));
        }
    } catch(err) {
        console.error(err);
        alert("Gagal koneksi server.");
    } finally {
        setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Upload Dataset (Multiple)</h2>
        <p className="text-gray-500 text-sm mb-8">Pilih banyak foto sekaligus untuk mempercepat proses training.</p>
        
        <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Masukkan NIM</label>
              <input type="text" value={nim} onChange={e => setNim(e.target.value)} placeholder="Contoh: 21001" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="border-2 border-dashed border-gray-300 p-10 text-center rounded-2xl hover:bg-gray-50 transition relative group cursor-pointer">
                {/* Tambahkan attribute 'multiple' disini */}
                <input type="file" onChange={handleFileChange} accept="image/*" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="text-gray-400 flex flex-col items-center group-hover:text-blue-500 transition-colors pointer-events-none">
                  <div className="bg-gray-100 p-4 rounded-full mb-3 group-hover:bg-blue-50 transition-colors">
                      <FileUp size={40}/>
                  </div>
                  <p className="font-medium text-gray-600">Klik atau geser banyak foto ke sini</p>
                  <p className="text-sm mt-1">Bisa pilih lebih dari satu</p>
                </div>
            </div>

            {/* Grid Preview (Fitur Baru) */}
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
                {uploading ? `Mengupload ${files.length} Foto...` : `Upload ${files.length} Foto ke Server`}
            </Button>
        </div>
    </div>
  );
};