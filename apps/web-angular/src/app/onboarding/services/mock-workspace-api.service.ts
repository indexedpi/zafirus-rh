import { Injectable } from '@angular/core';
import {
  AddUserToGroupsResponse,
  AnnounceInGroupResponse,
  ConfigureGmailSignatureResponse,
  CreateGoogleUserResponse,
  IWorkspaceApi,
  ProvisionWorkspaceResponse,
  RequestDeviceResponse,
  SendWelcomeEmailResponse,
} from './workspace-api.interface';

@Injectable({ providedIn: 'root' })
export class MockWorkspaceApiService implements IWorkspaceApi {
  async createGoogleUser(email: string, password: string, firstName: string, lastName: string): Promise<CreateGoogleUserResponse> {
    return this.simulate('createGoogleUser', { email, password, firstName, lastName }, {
      success: true,
      userId: this.makeId('user'),
    });
  }

  async addUserToGroups(userId: string, groupEmails: string[]): Promise<AddUserToGroupsResponse> {
    return this.simulate('addUserToGroups', { userId, groupEmails }, {
      success: true,
      assignmentId: this.makeId('groups'),
    });
  }

  async configureGmailSignature(userId: string, signature: string): Promise<ConfigureGmailSignatureResponse> {
    return this.simulate('configureGmailSignature', { userId, signature }, {
      success: true,
      signatureId: this.makeId('signature'),
    });
  }

  async sendWelcomeEmail(to: string, subject: string, body: string): Promise<SendWelcomeEmailResponse> {
    return this.simulate('sendWelcomeEmail', { to, subject, body }, {
      success: true,
      messageId: this.makeId('email'),
    });
  }

  async announceInGroup(groupEmail: string, message: string): Promise<AnnounceInGroupResponse> {
    return this.simulate('announceInGroup', { groupEmail, message }, {
      success: true,
      announcementId: this.makeId('announcement'),
    });
  }

  async requestDevice(employeeId: string, deviceType: string): Promise<RequestDeviceResponse> {
    return this.simulate('requestDevice', { employeeId, deviceType }, {
      success: true,
      requestId: this.makeId('device'),
    });
  }

  async provisionWorkspace(employeeId: string): Promise<ProvisionWorkspaceResponse> {
    return this.simulate('provisionWorkspace', { employeeId }, {
      success: true,
      workspaceUrl: `https://workspace.example.com/${this.makeId('workspace')}`,
    });
  }

  private async simulate<T extends Record<string, unknown>>(operation: string, payload: Record<string, unknown>, result: T): Promise<T> {
    const delay = this.randomDelay();
    console.debug(`[MockWorkspaceApi] ${operation} scheduled`, { delay, ...payload });

    await new Promise<void>(resolve => {
      setTimeout(resolve, delay);
    });

    console.debug(`[MockWorkspaceApi] ${operation} completed`, result);
    return result;
  }

  private randomDelay(): number {
    return 500 + Math.floor(Math.random() * 1001);
  }

  private makeId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
