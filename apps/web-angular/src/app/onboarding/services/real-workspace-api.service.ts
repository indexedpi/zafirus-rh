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
export class RealWorkspaceApiService implements IWorkspaceApi {
  async createGoogleUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<CreateGoogleUserResponse> {
    // TODO: Call the backend endpoint that provisions a Google Workspace user via Google Admin SDK.
    return { success: false, error: 'API no configurada' };
  }

  async addUserToGroups(userId: string, groupEmails: string[]): Promise<AddUserToGroupsResponse> {
    // TODO: Call the backend endpoint that adds the user to the required Google Groups.
    return { success: false, error: 'API no configurada' };
  }

  async configureGmailSignature(userId: string, signature: string): Promise<ConfigureGmailSignatureResponse> {
    // TODO: Call the backend endpoint that writes the approved Gmail signature template.
    return { success: false, error: 'API no configurada' };
  }

  async sendWelcomeEmail(to: string, subject: string, body: string): Promise<SendWelcomeEmailResponse> {
    // TODO: Call the backend email service that sends the onboarding welcome message.
    return { success: false, error: 'API no configurada' };
  }

  async announceInGroup(groupEmail: string, message: string): Promise<AnnounceInGroupResponse> {
    // TODO: Call the backend endpoint that posts the announcement into the selected Google Group.
    return { success: false, error: 'API no configurada' };
  }

  async requestDevice(employeeId: string, deviceType: string): Promise<RequestDeviceResponse> {
    // TODO: Call the backend IT workflow that opens a device provisioning ticket.
    return { success: false, error: 'API no configurada' };
  }

  async provisionWorkspace(employeeId: string): Promise<ProvisionWorkspaceResponse> {
    // TODO: Call the backend orchestration endpoint that completes full workspace provisioning.
    return { success: false, error: 'API no configurada' };
  }
}
