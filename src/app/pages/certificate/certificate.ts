import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CurriculumService } from '../../services/curriculum.service';

interface Certificate {
    userName: string;
    completionPercent: number;
    xp: number;
    completedLessons: number;
    totalLessons: number;
    issuedAt: string;
    certificateId: string;
}

@Component({
    selector: 'app-certificate',
    standalone: true,
    imports: [FormsModule, RouterLink, DatePipe],
    templateUrl: './certificate.html',
    styleUrl: './certificate.scss'
})
export class CertificateComponent implements OnInit {
    certificate: Certificate | null = null;
    loading = true;
    error = '';
    confirmName = '';
    nameError = '';
    confirmed = false;
    showNameForm = true;
    accountName = '';

    constructor(
        private authService: AuthService,
        private curriculumService: CurriculumService
    ) { }

    async ngOnInit() {
        const account = this.authService.getAccount();
        if (!account) {
            this.error = 'Avval account yarating';
            this.loading = false;
            return;
        }

        this.confirmName = account.fullName;
        this.accountName = account.fullName;
        this.loading = false;
    }

    async confirmNameAndLoad() {
        if (!this.confirmName.trim()) {
            this.nameError = 'Ism va familiya kiritilishi kerak.';
            return;
        }

        this.nameError = '';
        this.error = '';
        this.loading = true;

        const account = this.authService.getAccount();
        if (!account) {
            this.error = 'Avval account yarating';
            this.loading = false;
            return;
        }

        try {
            await this.curriculumService.syncProgress(account.id);
            await this.loadCertificate(account.id);
            this.confirmed = true;
            this.showNameForm = false;
        } finally {
            this.loading = false;
        }
    }

    private async loadCertificate(accountId: string) {
        try {
            const response = await fetch(`http://localhost:3000/api/certificate/${accountId}`);
            const data = await response.json();
            if (response.ok) {
                this.certificate = { ...data, userName: this.confirmName.trim() };
            } else {
                this.error = data.error || 'Certificate yaratish uchun ko\'proq dars tugating';
            }
        } catch (error) {
            this.error = 'Server bilan bog\'lanib bo\'lmadi';
        }
    }

    printCertificate() {
        window.print();
    }

    downloadCertificate() {
        // Simple download as image (could be improved with html2canvas)
        const element = document.querySelector('.certificate') as HTMLElement;
        if (element) {
            // For now, just print. Could add PDF generation later
            this.printCertificate();
        }
    }
}