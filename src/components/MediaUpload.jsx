import axiosInstance from '../services/axiosInstance';
import imageCompression from 'browser-image-compression';

const MAX_UPLOAD_MB = 100;
const ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime'
];

let lastUpload = 0;

export async function uploadToS3(file, onProgress, skipRateLimit = false) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Nicht authentifiziert');

    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Ungültiger Dateityp');
    }

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
        throw new Error('Datei zu groß');
    }

    const now = Date.now();
    if (!skipRateLimit && now - lastUpload < 3000) {
        throw new Error('Zu viele Uploads in kurzer Zeit');
    }
    lastUpload = now;

    // 📉 Kompression (nur bei Bildern)
    let fileToUpload = file;
    if (file.type.startsWith('image/')) {
        fileToUpload = await imageCompression(file, {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        });
    }

    // 1. PreSigned URL holen
    const presignResponse = await axiosInstance.post(
        `${import.meta.env.VITE_API_URL}/api/my-event/media/presign-upload`,
        { filename: file.name, mimeType: file.type },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    const { uploadUrl, ...metadata } = presignResponse.data;

    // 2. Upload mit fetch (statt axios)
    await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type
        },
        body: fileToUpload
    });

    // 3. Datenbank speichern
    const saveResponse = await axiosInstance.post(
        `${import.meta.env.VITE_API_URL}/api/my-event/media/save`,
        {
            filename: metadata.filename,
            path: metadata.path,
            type: file.type.startsWith('video') ? 'video' : 'image',
            size: fileToUpload.size,
        },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('DEBUG LOG:', saveResponse.data.debug); // ✅ Jetzt siehst du alles

    return {
        ...saveResponse.data,
        type: file.type.startsWith('video') ? 'video' : 'image',
    };
}
