import { Component, signal, computed, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EmailService, NaasNotification } from '../services/email.service';
import { NaasProviderGroup, ProviderGroupService } from '../services/providerGroup.service';

// interface FormNotification {
//   id: string;
//   recipients: NaasProviderGroup[];
//   subject: string;
//   body: string;
//   isDraft: string;
// }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: `./home.component.html`,
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private fb = inject(FormBuilder);
  
  view = signal<'list' | 'create'>('list');
  filter = signal<'all' | 'sent' | 'draft' | 'sending' | 'scheduled'>('all');
  toastMessage = signal<string | null>(null);
  showPreview = signal(false);
  notifications = signal<NaasNotification[]>([]);

  filteredNotifications = computed(() => {
    const all = this.notifications();
    switch (this.filter()) {
      case 'sent': return all.filter(n => n.isDraft == 's');
      case 'scheduled': return all.filter(n => n.sendDate > new Date().toISOString());
      case 'draft': return all.filter(n => n.isDraft === "y");
      default: return all;
    }
  });

  mqStatus = signal({ online: false, queueDepth: 0 });

  ngOnInit(): void {
    this.emailService.getNotifications().subscribe(res => {
      this.notifications.set(res);
    });

    this.providerGroupService.getAll().subscribe(res => {
      this.providers.set(res);
    })

    // Poll every 2 seconds to show "Live" movement
    setInterval(() => {
      // this.emailService.getMQStatus().subscribe(res => this.mqStatus.set(res));
    }, 2000);
  }

  editNotification(n: NaasNotification) {
    this.publicId = n.publicId || null;

    // map the public ids from n.recipients to the full provider groups
    const recipients = (n.recipients.map(r => this.providers().find(p => p.publicId === r)) || []) as NaasProviderGroup[];

    let scheduleDate = new Date(n.sendDate);
    let scheduleTime = '';
    
    // If the "sendDate" is in the past, we're editing a draft notification.
    // Simply reset to the current date.
    // Else extract the time of day from the scheduled notification.
    const now = new Date();
    if (now > scheduleDate) {
      scheduleDate = now;
    } else {
      const hours = scheduleDate.getHours().toString().padStart(2, '0');
      const minutes = scheduleDate.getMinutes().toString().padStart(2, '0');
      scheduleTime = `${hours}:${minutes}`
    }

    this.emailForm.setValue({
      recipients: recipients,
      subject: n.subject,
      body: n.body,
      scheduleDate: scheduleDate.toISOString().split("T")[0],
      scheduleTime: scheduleTime
    })

    this.view.set('create');
  }

  emailForm = this.fb.group({
    recipients: [[] as NaasProviderGroup[], [Validators.required, Validators.minLength(1)]],
    subject: ['', [Validators.required]],
    body: ['', [Validators.required]],
    scheduleDate: [new Date().toISOString().split("T")[0]], // Holds the 'YYYY-MM-DD'
    scheduleTime: ['']  // Holds the 'HH:mm'
  });

  publicId: any;
  providers = signal<NaasProviderGroup[]>([]);
  isDraft = 'n';

  // Generate time options for the dropdown (00:00, 00:15, etc.)
  timeOptions = signal<string[]>(this.generateTimeSlots());

  isScheduledMessage(n: NaasNotification): boolean {
    if (n.sendDate > new Date().toISOString()) return true
    else return false
  }

  private generateTimeSlots(): string[] {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  }

  // Helper to add a group from the dropdown
  addRecipient(event: Event) {
    const select = event.target as HTMLSelectElement;
    const selectedGroup: NaasProviderGroup = (this.providers() as any)[select.selectedIndex - 1];

    if (selectedGroup) {
      const current = this.emailForm.controls.recipients.value || [];
      // Only add if it's not already in the list
      if (!current.some(g => g.id === selectedGroup.id)) {
        this.emailForm.controls.recipients.setValue([...current, selectedGroup]);
      }
      // Reset the dropdown to the placeholder
      select.value = '';
    }
  }

  // Helper to remove a group via the pill 'x' button
  removeRecipient(groupId?: number) {
    const current = this.emailForm.controls.recipients.value || [];
    const updated = current.filter(g => g.id !== groupId);
    this.emailForm.controls.recipients.setValue(updated);
  }

  sendEmail() {
    const formValue = this.emailForm.value;
    const recipientIds: string[] = (formValue.recipients || [])
      .map(r => r.publicId)
      .filter((id): id is string => !!id);

    let finalSendDate: string
    if (formValue.scheduleDate && formValue.scheduleTime) {
      // Combine date and time: "2026-05-08T14:15:00"
      const combined = `${formValue.scheduleDate}T${formValue.scheduleTime}:00`;
      // Convert to UTC ISO string for the backend
      finalSendDate = new Date(combined).toISOString();
    } else {
      // Default to 'now' if no schedule is picked
      finalSendDate = new Date().toISOString();
    }

    
    const notificationPayload: NaasNotification = {
      subject: formValue.subject || '',
      body: formValue.body || '',
      isDraft: this.isDraft,
      recipients: recipientIds,
      sendDate: finalSendDate || new Date().toISOString(),
      publicId: this.publicId
    };
  
    // Trigger the API call
    this.emailService.createNotification(notificationPayload).subscribe({
      next: (res) => {
        console.log('Notification sent successfully:', res);
        
        this.emailService.getNotifications().subscribe(res => {
          this.notifications.set(res);
          this.view.set('list');
          this.filter.set('all');
          this.emailForm.reset();
        })
      },
      error: (err) => console.error('Error sending notification:', err)
    });
  }

  deleteNotification(id: string) {
    // this.notifications.update(list => list.filter(n => n.id !== id));
    // this.showToast('Notification cleared');
  }

  saveDraft() {
    // this.addNotification('draft');
    // this.showToast('Draft updated and saved');
    // this.view.set('list');
    this.isDraft = 'y';
    this.sendEmail();
  }

  // private addNotification(status: NotificationStatus) {
  //   const val = this.emailForm.value;
  //   const newNote: EmailNotification = {
  //     id: Math.random().toString(36).substring(7),
  //     recipients: val.recipients || '',
  //     subject: val.subject || '',
  //     body: val.body || '',
  //     status,
  //     timestamp: new Date()
  //   };
  //   this.notifications.update(list => [newNote, ...list]);
  //   this.emailForm.reset();
  //   this.showPreview.set(false);
  // }

  // private showToast(msg: string) {
  //   this.toastMessage.set(msg);
  //   setTimeout(() => this.toastMessage.set(null), 3500);
  // }

  constructor(private emailService: EmailService, private providerGroupService: ProviderGroupService) {};
}