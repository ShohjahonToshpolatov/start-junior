import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CameraService {
    private stream: MediaStream | null = null;
    private cameraActive$ = new BehaviorSubject<boolean>(false);
    private permissionDenied$ = new BehaviorSubject<boolean>(false);

    constructor() { }

    async requestCameraAccess(): Promise<MediaStream | null> {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 320 },
                    height: { ideal: 240 }
                },
                audio: false
            });
            this.cameraActive$.next(true);
            this.permissionDenied$.next(false);
            return this.stream;
        } catch (error) {
            console.error('Kamera ruxsat berilmadi:', error);
            this.permissionDenied$.next(true);
            this.cameraActive$.next(false);
            return null;
        }
    }

    stopCamera(): void {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.cameraActive$.next(false);
        }
    }

    getStream(): MediaStream | null {
        return this.stream;
    }

    isCameraActive$(): Observable<boolean> {
        return this.cameraActive$.asObservable();
    }

    isPermissionDenied$(): Observable<boolean> {
        return this.permissionDenied$.asObservable();
    }

    detectInactivity(callback: () => void, timeoutMs: number = 5000): void {
        if (!this.stream) return;

        let inactivityTimer: any;

        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                callback();
            }, timeoutMs);
        };

        document.addEventListener('mousemove', resetTimer);
        document.addEventListener('keydown', resetTimer);
        document.addEventListener('click', resetTimer);

        resetTimer();
    }
}