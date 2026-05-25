import { InjectionToken } from '@angular/core';

export interface WorkspaceApiResponse {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

export interface CreateGoogleUserResponse extends WorkspaceApiResponse {
  userId?: string;
}

export interface AddUserToGroupsResponse extends WorkspaceApiResponse {}

export interface ConfigureGmailSignatureResponse extends WorkspaceApiResponse {}

export interface SendWelcomeEmailResponse extends WorkspaceApiResponse {}

export interface AnnounceInGroupResponse extends WorkspaceApiResponse {}

export interface RequestDeviceResponse extends WorkspaceApiResponse {}

export interface ProvisionWorkspaceResponse extends WorkspaceApiResponse {
  workspaceUrl?: string;
}

export interface IWorkspaceApi {
  /**
   * Creates the employee's Google Workspace user account in production.
   */
  createGoogleUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<CreateGoogleUserResponse>;

  /**
   * Adds the new user to the required Google Groups in production.
   */
  addUserToGroups(userId: string, groupEmails: string[]): Promise<AddUserToGroupsResponse>;

  /**
   * Updates the Gmail signature so the new user has the approved template in production.
   */
  configureGmailSignature(userId: string, signature: string): Promise<ConfigureGmailSignatureResponse>;

  /**
   * Sends the onboarding welcome email to the employee in production.
   */
  sendWelcomeEmail(to: string, subject: string, body: string): Promise<SendWelcomeEmailResponse>;

  /**
   * Posts the onboarding announcement into the requested Google Group in production.
   */
  announceInGroup(groupEmail: string, message: string): Promise<AnnounceInGroupResponse>;

  /**
   * Opens the device request flow so IT can prepare the assigned equipment in production.
   */
  requestDevice(employeeId: string, deviceType: string): Promise<RequestDeviceResponse>;

  /**
   * Runs the full workspace provisioning flow and returns the created workspace URL in production.
   */
  provisionWorkspace(employeeId: string): Promise<ProvisionWorkspaceResponse>;
}

export const WORKSPACE_API = new InjectionToken<IWorkspaceApi>('WORKSPACE_API');
