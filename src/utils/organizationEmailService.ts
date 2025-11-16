import { 
  sendOrganizationSubmissionEmail, 
  sendOrganizationApprovalEmail, 
  sendOrganizationRejectionEmail,
  sendAdminNewSubmissionEmail,
  type OrganizationSubmissionEmailData,
  type OrganizationApprovalEmailData,
  type OrganizationRejectionEmailData,
  type AdminNewSubmissionEmailData
} from '../api/notifications';
import { pathRoutes } from '../config/pathRoutes';
import { envConfig } from '../config/envConfig';

/**
 * Utility class for handling organization email notifications
 */
export class OrganizationEmailService {
  /**
   * Send confirmation email after organization submission
   */
  static async sendSubmissionConfirmation(
    organizationData: {
      legalName: string;
      publicName: string;
      id: string;
    },
    userData: {
      email: string;
      firstName: string;
      lastName: string;
    }
  ): Promise<boolean> {
    try {
      const emailData: OrganizationSubmissionEmailData = {
        organizationName: organizationData.publicName || organizationData.legalName,
        submitterName: `${userData.firstName} ${userData.lastName}`,
        submissionDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        trackingId: organizationData.id,
        reviewTimeline: '3-5 business days',
        contactEmail: 'support@credence.ng' // This should be configurable
      };

      await sendOrganizationSubmissionEmail(userData.email, emailData);
      return true;
    } catch (error) {
      console.error('Failed to send submission confirmation email:', error);
      return false;
    }
  }

  /**
   * Send approval notification email
   */
  static async sendApprovalNotification(
    organizationData: {
      legalName: string;
      publicName: string;
      id: string;
    },
    userData: {
      email: string;
      firstName: string;
      lastName: string;
    },
    adminData: {
      firstName: string;
      lastName: string;
    },
    approvalNotes?: string
  ): Promise<boolean> {
    try {
      const emailData: OrganizationApprovalEmailData = {
        organizationName: organizationData.publicName || organizationData.legalName,
        submitterName: `${userData.firstName} ${userData.lastName}`,
        approvalDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        approvalNotes,
        adminName: `${adminData.firstName} ${adminData.lastName}`,
        nextSteps: [
          'Log in to your account to access organization features',
          'Set up your organization profile and branding',
          'Invite team members to your organization',
          'Begin issuing and verifying credentials'
        ],
        loginUrl: `${window.location.origin}${pathRoutes.auth.sinIn}`,
        contactEmail: 'support@credence.ng'
      };

      await sendOrganizationApprovalEmail(userData.email, organizationData.id, emailData);
      return true;
    } catch (error) {
      console.error('Failed to send approval notification email:', error);
      return false;
    }
  }

  /**
   * Send rejection notification email
   */
  static async sendRejectionNotification(
    organizationData: {
      legalName: string;
      publicName: string;
      id: string;
    },
    userData: {
      email: string;
      firstName: string;
      lastName: string;
    },
    adminData: {
      firstName: string;
      lastName: string;
    },
    rejectionReason: string,
    rejectionNotes?: string
  ): Promise<boolean> {
    try {
      const emailData: OrganizationRejectionEmailData = {
        organizationName: organizationData.publicName || organizationData.legalName,
        submitterName: `${userData.firstName} ${userData.lastName}`,
        rejectionDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        rejectionReason,
        rejectionNotes,
        adminName: `${adminData.firstName} ${adminData.lastName}`,
        resubmissionInstructions: [
          'Review and address the rejection reason mentioned above',
          'Update your organization information as needed',
          'Ensure all required documentation is accurate and complete',
          'Resubmit your organization registration'
        ],
        contactEmail: 'support@credence.ng',
        resubmissionUrl: `${window.location.origin}${pathRoutes.users.registerOrganization}`
      };

      await sendOrganizationRejectionEmail(userData.email, organizationData.id, emailData);
      return true;
    } catch (error) {
      console.error('Failed to send rejection notification email:', error);
      return false;
    }
  }

  /**
   * Send admin notification for new submission
   */
  static async sendAdminNotification(
    organizationData: {
      legalName: string;
      publicName: string;
      regulator: string;
    },
    userData: {
      email: string;
      firstName: string;
      lastName: string;
    },
    totalPendingCount: number
  ): Promise<boolean> {
    try {
      // Get admin emails - this should be configurable or fetched from a service
      const adminEmails = ['admin@credence.ng']; // This should be fetched from backend

      const emailData: AdminNewSubmissionEmailData = {
        organizationName: organizationData.publicName || organizationData.legalName,
        submitterName: `${userData.firstName} ${userData.lastName}`,
        submitterEmail: userData.email,
        submissionDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        regulator: organizationData.regulator,
        reviewUrl: `${window.location.origin}${pathRoutes.admin.organizationVerification}`,
        totalPendingCount
      };

      await sendAdminNewSubmissionEmail(adminEmails, emailData);
      return true;
    } catch (error) {
      console.error('Failed to send admin notification email:', error);
      return false;
    }
  }

  /**
   * Get formatted organization name for display
   */
  static getDisplayName(organizationData: { legalName: string; publicName?: string }): string {
    return organizationData.publicName || organizationData.legalName;
  }

  /**
   * Generate tracking message for user display
   */
  static generateTrackingMessage(organizationId: string): string {
    return `Your organization submission has been received. Track your application with ID: ${organizationId}. You will receive email updates on the status of your review.`;
  }

  /**
   * Get email template preview data for testing
   */
  static getTemplatePreviewData() {
    return {
      organization_submitted: {
        organizationName: 'Acme Corporation Ltd',
        submitterName: 'John Doe',
        submissionDate: 'January 15, 2025',
        trackingId: 'ORG-2025-001',
        reviewTimeline: '3-5 business days',
        contactEmail: 'support@credence.ng'
      },
      organization_approved: {
        organizationName: 'Acme Corporation Ltd',
        submitterName: 'John Doe',
        approvalDate: 'January 18, 2025',
        approvalNotes: 'All documentation has been verified successfully.',
        adminName: 'Jane Admin',
        nextSteps: [
          'Log in to your account to access organization features',
          'Set up your organization profile and branding',
          'Invite team members to your organization',
          'Begin issuing and verifying credentials'
        ],
        loginUrl: 'https://platform.credence.ng/authentication/sign-in',
        contactEmail: 'support@credence.ng'
      },
      organization_rejected: {
        organizationName: 'Acme Corporation Ltd',
        submitterName: 'John Doe',
        rejectionDate: 'January 18, 2025',
        rejectionReason: 'Invalid company registration number',
        rejectionNotes: 'Please provide a valid company registration number and ensure all documentation is accurate.',
        adminName: 'Jane Admin',
        resubmissionInstructions: [
          'Review and address the rejection reason mentioned above',
          'Update your organization information as needed',
          'Ensure all required documentation is accurate and complete',
          'Resubmit your organization registration'
        ],
        contactEmail: 'support@credence.ng',
        resubmissionUrl: 'https://platform.credence.ng/register-organization'
      },
      admin_new_submission: {
        organizationName: 'Acme Corporation Ltd',
        submitterName: 'John Doe',
        submitterEmail: 'john.doe@example.com',
        submissionDate: 'January 15, 2025 at 2:30 PM',
        regulator: 'Central Bank of Nigeria',
        reviewUrl: 'https://platform.credence.ng/admin/organization-verification',
        totalPendingCount: 5
      }
    };
  }
}
