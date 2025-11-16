import { apiRoutes } from "../config/apiRoutes";
import { axiosPost, axiosGet, axiosPut } from "../services/apiRequests";
import type { AxiosResponse } from "axios";

// Email notification interfaces
export interface EmailNotificationRequest {
  to: string;
  templateType:
    | "organization_submitted"
    | "organization_approved"
    | "organization_rejected"
    | "admin_new_submission";
  templateData: Record<string, any>;
  organizationId?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  templateType: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export interface EmailNotificationResponse {
  id: string;
  status: "sent" | "pending" | "failed";
  sentAt?: string;
  error?: string;
}

// Organization submission confirmation email
export interface OrganizationSubmissionEmailData {
  organizationName: string;
  submitterName: string;
  submissionDate: string;
  trackingId: string;
  reviewTimeline: string;
  contactEmail: string;
}

// Organization approval email
export interface OrganizationApprovalEmailData {
  organizationName: string;
  submitterName: string;
  approvalDate: string;
  approvalNotes?: string;
  adminName: string;
  nextSteps: string[];
  loginUrl: string;
  contactEmail: string;
}

// Organization rejection email
export interface OrganizationRejectionEmailData {
  organizationName: string;
  submitterName: string;
  rejectionDate: string;
  rejectionReason: string;
  rejectionNotes?: string;
  adminName: string;
  resubmissionInstructions: string[];
  contactEmail: string;
  resubmissionUrl: string;
}

// Admin notification email
export interface AdminNewSubmissionEmailData {
  organizationName: string;
  submitterName: string;
  submitterEmail: string;
  submissionDate: string;
  regulator: string;
  reviewUrl: string;
  totalPendingCount: number;
}

/**
 * Send organization submission confirmation email
 */
export const sendOrganizationSubmissionEmail = async (
  to: string,
  data: OrganizationSubmissionEmailData
): Promise<AxiosResponse> => {
  const payload: EmailNotificationRequest = {
    to,
    templateType: "organization_submitted",
    templateData: data,
  };

  const url = `${apiRoutes.notifications.sendEmail}`;
  return axiosPost({ url, payload });
};

/**
 * Send organization approval email
 */
export const sendOrganizationApprovalEmail = async (
  to: string,
  organizationId: string,
  data: OrganizationApprovalEmailData
): Promise<AxiosResponse> => {
  const payload: EmailNotificationRequest = {
    to,
    templateType: "organization_approved",
    templateData: data,
    organizationId,
  };

  const url = `${apiRoutes.notifications.sendEmail}`;
  return axiosPost({ url, payload });
};

/**
 * Send organization rejection email
 */
export const sendOrganizationRejectionEmail = async (
  to: string,
  organizationId: string,
  data: OrganizationRejectionEmailData
): Promise<AxiosResponse> => {
  const payload: EmailNotificationRequest = {
    to,
    templateType: "organization_rejected",
    templateData: data,
    organizationId,
  };

  const url = `${apiRoutes.notifications.sendEmail}`;
  return axiosPost({ url, payload });
};

/**
 * Send admin notification for new organization submission
 */
export const sendAdminNewSubmissionEmail = async (
  adminEmails: string[],
  data: AdminNewSubmissionEmailData
): Promise<AxiosResponse[]> => {
  const promises = adminEmails.map((email) => {
    const payload: EmailNotificationRequest = {
      to: email,
      templateType: "admin_new_submission",
      templateData: data,
    };

    const url = `${apiRoutes.notifications.sendEmail}`;
    return axiosPost({ url, payload });
  });

  return Promise.all(promises);
};

/**
 * Get email templates for admin management
 */
export const getEmailTemplates = async (): Promise<AxiosResponse> => {
  const url = `${apiRoutes.notifications.templates}`;
  return axiosGet({ url });
};

/**
 * Update email template
 */
export const updateEmailTemplate = async (
  templateId: string,
  templateData: Partial<EmailTemplate>
): Promise<AxiosResponse> => {
  const url = `${apiRoutes.notifications.updateTemplate}/${templateId}`;
  return axiosPut({ url, payload: templateData });
};

/**
 * Get email notification history
 */
export const getEmailNotificationHistory = async (
  organizationId?: string,
  page: number = 1,
  limit: number = 20
): Promise<AxiosResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (organizationId) {
    params.append("organizationId", organizationId);
  }

  const url = `${apiRoutes.notifications.history}?${params.toString()}`;
  return axiosGet({ url });
};

/**
 * Resend email notification
 */
export const resendEmailNotification = async (
  notificationId: string
): Promise<AxiosResponse> => {
  const url = `${apiRoutes.notifications.resend}/${notificationId}`;
  return axiosPost({ url });
};

/**
 * Test email template
 */
export const testEmailTemplate = async (
  templateType: string,
  testEmail: string,
  testData: Record<string, any>
): Promise<AxiosResponse> => {
  const payload = {
    templateType,
    testEmail,
    testData,
  };

  const url = `${apiRoutes.notifications.testTemplate}`;
  return axiosPost({ url, payload });
};
