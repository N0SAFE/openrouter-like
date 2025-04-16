import { z } from 'zod';
import crypto from 'crypto';

// SSO Provider types
export enum SSOProviderType {
  GOOGLE_WORKSPACE = 'google_workspace',
  MICROSOFT_ENTRA = 'microsoft_entra',
  OKTA = 'okta',
  AUTH0 = 'auth0',
  ONELOGIN = 'onelogin',
  CUSTOM_SAML = 'custom_saml',
  CUSTOM_OAUTH = 'custom_oauth',
}

// SSO Configuration Interface
export interface SSOConfiguration {
  id: string;
  organizationId: string;
  providerType: SSOProviderType;
  enabled: boolean;
  displayName: string;
  description?: string;
  domain?: string; // For domain-based auto-routing
  createdAt: Date;
  updatedAt: Date;
  metadata: SSOProviderMetadata;
  attributeMapping: AttributeMapping;
  allowedEmailDomains: string[];
  enforceSSO: boolean; // If true, users must use SSO
  createdBy: string;
}

// Provider-specific metadata
export type SSOProviderMetadata = 
  | GoogleWorkspaceMetadata
  | MicrosoftEntraMetadata
  | OktaMetadata
  | Auth0Metadata
  | OneLoginMetadata
  | CustomSAMLMetadata
  | CustomOAuthMetadata;

// Google Workspace metadata
export interface GoogleWorkspaceMetadata {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  hostedDomain?: string;
}

// Microsoft Entra (Azure AD) metadata
export interface MicrosoftEntraMetadata {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scopes: string[];
}

// Okta metadata
export interface OktaMetadata {
  orgUrl: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scopes: string[];
  authServerId?: string;
}

// Auth0 metadata
export interface Auth0Metadata {
  domain: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

// OneLogin metadata
export interface OneLoginMetadata {
  issuer: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  region?: string;
}

// Custom SAML metadata
export interface CustomSAMLMetadata {
  entityId: string;
  assertionConsumerServiceUrl: string;
  idpUrl: string;
  idpCertificate: string;
  spCertificate?: string;
  spPrivateKey?: string;
  nameIdFormat?: string;
  wantAssertionsSigned?: boolean;
  signatureAlgorithm?: string;
}

// Custom OAuth metadata
export interface CustomOAuthMetadata {
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl?: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scopes: string[];
  extraParams?: Record<string, string>;
}

// Attribute mapping between SSO provider and our system
export interface AttributeMapping {
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  roles?: string;
  groups?: string;
  customAttributes?: Record<string, string>;
}

// Schema for creating/updating SSO configuration
export const SSOConfigurationSchema = z.object({
  providerType: z.nativeEnum(SSOProviderType),
  enabled: z.boolean().default(true),
  displayName: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  domain: z.string().optional(),
  metadata: z.record(z.any()),
  attributeMapping: z.object({
    email: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    displayName: z.string().optional(),
    roles: z.string().optional(),
    groups: z.string().optional(),
    customAttributes: z.record(z.string()).optional(),
  }),
  allowedEmailDomains: z.array(z.string()).default([]),
  enforceSSO: z.boolean().default(false),
});

export type SSOConfigurationInput = z.infer<typeof SSOConfigurationSchema>;

// SAML Request/Response
export interface SAMLRequest {
  id: string;
  issuer: string;
  destination: string;
  acsUrl: string;
  relayState?: string;
  createdAt: Date;
  expiresAt: Date;
  encodedRequest: string;
}

export interface SAMLResponse {
  id: string;
  issuer: string;
  inResponseTo?: string;
  destination: string;
  nameID: string;
  attributes: Record<string, string | string[]>;
  sessionIndex?: string;
  authnContextClassRef?: string;
  notBefore?: Date;
  notOnOrAfter?: Date;
}

// JIT (Just-In-Time) Provisioning settings
export interface JITProvisioningSettings {
  enabled: boolean;
  defaultRole: string;
  defaultApiAccess: boolean;
  createMissingGroups: boolean;
  groupMapping?: Record<string, string>; // Map IdP groups to our groups
}

// SSO Session
export interface SSOSession {
  id: string;
  userId: string;
  organizationId: string;
  ssoConfigId: string;
  provider: SSOProviderType;
  createdAt: Date;
  expiresAt: Date;
  lastAccessedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  idpSessionId?: string;
  metadata?: Record<string, any>;
}

// Enterprise SSO Manager Class
export class EnterpriseSSOManager {
  private static instance: EnterpriseSSOManager;
  private ssoConfigurations: Map<string, SSOConfiguration> = new Map();
  private ssoSessions: Map<string, SSOSession> = new Map();
  private samlRequests: Map<string, SAMLRequest> = new Map();
  
  private constructor() {}
  
  public static getInstance(): EnterpriseSSOManager {
    if (!EnterpriseSSOManager.instance) {
      EnterpriseSSOManager.instance = new EnterpriseSSOManager();
    }
    return EnterpriseSSOManager.instance;
  }

  /**
   * Create a new SSO configuration
   */
  public createSSOConfiguration(
    input: SSOConfigurationInput,
    organizationId: string,
    createdBy: string
  ): SSOConfiguration {
    const id = `sso_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const config: SSOConfiguration = {
      id,
      organizationId,
      providerType: input.providerType,
      enabled: input.enabled ?? true,
      displayName: input.displayName,
      description: input.description,
      domain: input.domain,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: input.metadata as SSOProviderMetadata,
      attributeMapping: input.attributeMapping,
      allowedEmailDomains: input.allowedEmailDomains || [],
      enforceSSO: input.enforceSSO ?? false,
      createdBy,
    };
    
    this.ssoConfigurations.set(id, config);
    return config;
  }

  /**
   * Get SSO configuration by ID
   */
  public getSSOConfiguration(id: string): SSOConfiguration | undefined {
    return this.ssoConfigurations.get(id);
  }

  /**
   * Update SSO configuration
   */
  public updateSSOConfiguration(
    id: string,
    input: Partial<SSOConfigurationInput>,
    organizationId: string
  ): SSOConfiguration | null {
    const config = this.ssoConfigurations.get(id);
    
    if (!config || config.organizationId !== organizationId) {
      return null;
    }
    
    const updatedConfig: SSOConfiguration = {
      ...config,
      ...(input.providerType !== undefined && { providerType: input.providerType }),
      ...(input.enabled !== undefined && { enabled: input.enabled }),
      ...(input.displayName !== undefined && { displayName: input.displayName }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.domain !== undefined && { domain: input.domain }),
      ...(input.metadata !== undefined && { metadata: input.metadata as SSOProviderMetadata }),
      ...(input.attributeMapping !== undefined && { attributeMapping: {
        ...config.attributeMapping,
        ...input.attributeMapping,
      }}),
      ...(input.allowedEmailDomains !== undefined && { allowedEmailDomains: input.allowedEmailDomains }),
      ...(input.enforceSSO !== undefined && { enforceSSO: input.enforceSSO }),
      updatedAt: new Date(),
    };
    
    this.ssoConfigurations.set(id, updatedConfig);
    return updatedConfig;
  }

  /**
   * Delete SSO configuration
   */
  public deleteSSOConfiguration(id: string, organizationId: string): boolean {
    const config = this.ssoConfigurations.get(id);
    
    if (!config || config.organizationId !== organizationId) {
      return false;
    }
    
    return this.ssoConfigurations.delete(id);
  }

  /**
   * List SSO configurations for an organization
   */
  public listSSOConfigurations(organizationId: string): SSOConfiguration[] {
    return Array.from(this.ssoConfigurations.values())
      .filter(config => config.organizationId === organizationId);
  }

  /**
   * Find SSO configuration by domain
   */
  public findConfigurationByDomain(domain: string): SSOConfiguration | undefined {
    return Array.from(this.ssoConfigurations.values())
      .find(config => 
        config.enabled && 
        config.domain === domain ||
        config.allowedEmailDomains.includes(domain)
      );
  }

  /**
   * Initialize SAML authentication request
   */
  public initiateSAMLRequest(
    configId: string,
    relayState?: string
  ): { url: string; requestId: string } | null {
    const config = this.ssoConfigurations.get(configId);
    
    if (!config || !config.enabled || 
        (config.providerType !== SSOProviderType.CUSTOM_SAML && 
         config.providerType !== SSOProviderType.OKTA)) {
      return null;
    }
    
    // Generate SAML request ID
    const requestId = `req_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
    
    // In a real implementation, we would generate an actual SAML request
    // For this example, we'll create a mock one
    const metadata = config.metadata as CustomSAMLMetadata;
    
    const samlRequest: SAMLRequest = {
      id: requestId,
      issuer: metadata.entityId,
      destination: metadata.idpUrl,
      acsUrl: metadata.assertionConsumerServiceUrl,
      relayState,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
      encodedRequest: `mock_encoded_saml_request_${requestId}`, // In real implementation, this would be properly encoded
    };
    
    // Store the SAML request
    this.samlRequests.set(requestId, samlRequest);
    
    // Construct the redirect URL
    const params = new URLSearchParams();
    params.append('SAMLRequest', samlRequest.encodedRequest);
    if (relayState) params.append('RelayState', relayState);
    
    return {
      url: `${metadata.idpUrl}?${params.toString()}`,
      requestId,
    };
  }

  /**
   * Process SAML response from IdP
   */
  public processSAMLResponse(
    encodedResponse: string,
    relayState?: string
  ): { userId: string; sessionId: string } | null {
    // In a real implementation, this would parse and validate the SAML response
    // For this example, we'll just simulate it
    
    // Mock SAML response parsing
    const mockResponse: SAMLResponse = {
      id: `resp_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`,
      issuer: 'https://idp.example.com',
      inResponseTo: 'mock_request_id', // This would match a real request ID
      destination: 'https://api.openrouter.ai/auth/saml/callback',
      nameID: 'user@example.com',
      attributes: {
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        groups: ['Admins', 'Developers'],
      },
      sessionIndex: 'mock_session_index',
    };
    
    // Find the request this response is for
    const samlRequest = Array.from(this.samlRequests.values())
      .find(req => req.id === mockResponse.inResponseTo);
    
    if (!samlRequest) {
      // No matching request found or request expired
      return null;
    }
    
    // Find the SSO configuration
    const ssoConfig = Array.from(this.ssoConfigurations.values())
      .find(config => {
        if (config.providerType === SSOProviderType.CUSTOM_SAML) {
          const metadata = config.metadata as CustomSAMLMetadata;
          return metadata.entityId === samlRequest.issuer;
        }
        return false;
      });
    
    if (!ssoConfig) {
      return null;
    }
    
    // In a real implementation, we would validate the response signature and assertions
    
    // Map attributes according to configuration
    const email = mockResponse.attributes[ssoConfig.attributeMapping.email] as string;
    
    if (!email) {
      // Required attribute missing
      return null;
    }
    
    // Check if email domain is allowed
    const emailDomain = email.split('@')[1];
    if (ssoConfig.allowedEmailDomains.length > 0 && 
        !ssoConfig.allowedEmailDomains.includes(emailDomain)) {
      return null;
    }
    
    // In a real implementation, here we would:
    // 1. Look up user by email or create a new one (JIT provisioning)
    // 2. Assign roles/permissions based on SAML attributes and mappings
    // 3. Create a session
    
    // For this example, we'll create a mock session
    const sessionId = `sess_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
    const userId = `user_${email.split('@')[0]}`;
    
    const session: SSOSession = {
      id: sessionId,
      userId,
      organizationId: ssoConfig.organizationId,
      ssoConfigId: ssoConfig.id,
      provider: ssoConfig.providerType,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hour session
      lastAccessedAt: new Date(),
      idpSessionId: mockResponse.sessionIndex,
    };
    
    // Store the session
    this.ssoSessions.set(sessionId, session);
    
    return { userId, sessionId };
  }

  /**
   * Validate and refresh an SSO session
   */
  public validateSession(sessionId: string): boolean {
    const session = this.ssoSessions.get(sessionId);
    
    if (!session) {
      return false;
    }
    
    // Check if session has expired
    if (session.expiresAt < new Date()) {
      this.ssoSessions.delete(sessionId);
      return false;
    }
    
    // Update last accessed timestamp
    session.lastAccessedAt = new Date();
    this.ssoSessions.set(sessionId, session);
    
    return true;
  }

  /**
   * End an SSO session
   */
  public endSession(sessionId: string): boolean {
    return this.ssoSessions.delete(sessionId);
  }

  /**
   * Test SSO configuration connection
   */
  public async testConnection(configId: string): Promise<{
    success: boolean;
    message: string;
    details?: Record<string, any>;
  }> {
    const config = this.ssoConfigurations.get(configId);
    
    if (!config) {
      return {
        success: false,
        message: 'SSO configuration not found',
      };
    }
    
    // In a real implementation, this would actually test the connection to the IdP
    // For this example, we'll just simulate it
    
    // Mock successful test
    return {
      success: true,
      message: 'Successfully connected to the identity provider',
      details: {
        provider: config.providerType,
        idpMetadata: 'Retrieved successfully',
        connectionEstablished: true,
        certificateValid: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    };
  }
}

export default EnterpriseSSOManager.getInstance();
