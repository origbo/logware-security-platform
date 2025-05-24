// @ts-ignore
import { v4 as uuidv4 } from "uuid";
// @ts-ignore
import { addDays, subDays } from "date-fns";
import { LogEntry } from "../pages/logs/LogsPage";
import {
  ComplianceFramework,
  ComplianceControl,
  ComplianceAudit,
} from "../pages/compliance/CompliancePage";
import {
  Vulnerability,
  ScanResult,
} from "../pages/vulnerabilities/VulnerabilitiesPage";
import {
  NetworkDevice,
  TrafficData,
  NetworkAlert,
} from "../pages/network/NetworkMonitoringPage";

// Generate a random date within the last 7 days
const randomDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 7);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);

  return subDays(now, daysAgo);
};

// Security log sources
const logSources = [
  "Firewall",
  "IDS",
  "Authentication Service",
  "Network Scanner",
  "Web Application",
  "Database",
  "Operating System",
  "Cloud Service",
  "Email Gateway",
  "VPN",
  "Active Directory",
  "DLP System",
  "Endpoint Protection",
];

// Generate sample IP addresses
const generateIp = () => {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(
    Math.random() * 256
  )}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
};

// Generate user IDs
const userIds = [
  "user_ad45f",
  "admin_78def",
  "dev_12345",
  "sec_analyst_01",
  "guest_visitor",
  "api_service",
  "scheduler_job",
  "backup_service",
];

// Sample resource IDs
const resourceIds = [
  "server-prod-01",
  "api-gateway-main",
  "db-cluster-01",
  "storage-bucket-logs",
  "web-server-02",
  "lambda-function-auth",
  "container-app-frontend",
];

// Common security log tags
const securityTags = [
  "authentication",
  "authorization",
  "access-control",
  "data-breach",
  "encryption",
  "compliance",
  "network-security",
  "input-validation",
  "session-management",
  "malware",
  "audit",
  "backup",
  "incident-response",
];

// Log error messages
const errorMessages = [
  "Authentication failed",
  "Unauthorized access attempt",
  "SSL certificate validation error",
  "API rate limit exceeded",
  "Database connection failed",
  "Service unavailable",
  "Permission denied",
  "Invalid input detected",
  "Network connectivity issue",
  "Memory allocation error",
];

// Log warning messages
const warningMessages = [
  "Multiple login attempts detected",
  "CPU usage above threshold",
  "Memory usage at 85%",
  "Slow database query detected",
  "API response time degraded",
  "Invalid request parameters",
  "Session timeout",
  "Temporary network latency",
  "Service restarting",
  "Configuration override applied",
];

// Log info messages
const infoMessages = [
  "User login successful",
  "Scheduled backup completed",
  "System update applied",
  "Configuration changed",
  "User account created",
  "API endpoint accessed",
  "Database query executed",
  "File upload successful",
  "Password reset completed",
  "Service started successfully",
];

// Log debug messages
const debugMessages = [
  "Function call parameters",
  "Variable state dumped",
  "API request details",
  "SQL query execution plan",
  "Cache hit/miss details",
  "Thread allocation info",
  "Object serialization debug",
  "Authentication flow trace",
  "Network packet inspection",
  "Session token details",
];

// Generate a random log entry
const generateLogEntry = (): LogEntry => {
  // Determine log level
  const levelRandom = Math.random();
  let level: "error" | "warning" | "info" | "debug";
  let message = "";
  let details = "";

  if (levelRandom < 0.15) {
    level = "error";
    message = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    details = `Error occurred during system operation. ${message}. Trace ID: ${uuidv4().substring(
      0,
      8
    )}`;
  } else if (levelRandom < 0.35) {
    level = "warning";
    message =
      warningMessages[Math.floor(Math.random() * warningMessages.length)];
    details = `Warning event detected. ${message}. This may require attention if it persists.`;
  } else if (levelRandom < 0.75) {
    level = "info";
    message = infoMessages[Math.floor(Math.random() * infoMessages.length)];
    details = `Informational log entry: ${message}. Operation completed without issues.`;
  } else {
    level = "debug";
    message = debugMessages[Math.floor(Math.random() * debugMessages.length)];
    details = `Debug information: ${message}. Technical details for troubleshooting.`;
  }

  // Generate random source
  const source = logSources[Math.floor(Math.random() * logSources.length)];

  // Generate random tags (1-3)
  const numTags = Math.floor(Math.random() * 3) + 1;
  const tags: string[] = [];
  for (let i = 0; i < numTags; i++) {
    const tag = securityTags[Math.floor(Math.random() * securityTags.length)];
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }

  // Determine if we should add IP, userId, etc. based on the log type
  const shouldAddIp = Math.random() > 0.3;
  const shouldAddUserId = Math.random() > 0.4;
  const shouldAddSessionId = Math.random() > 0.6;
  const shouldAddResourceId = Math.random() > 0.5;

  return {
    id: uuidv4(),
    timestamp: randomDate(),
    level,
    source,
    message,
    details,
    ipAddress: shouldAddIp ? generateIp() : undefined,
    userId: shouldAddUserId
      ? userIds[Math.floor(Math.random() * userIds.length)]
      : undefined,
    sessionId: shouldAddSessionId
      ? `session_${Math.random().toString(36).substring(2, 10)}`
      : undefined,
    resourceId: shouldAddResourceId
      ? resourceIds[Math.floor(Math.random() * resourceIds.length)]
      : undefined,
    tags,
  };
};

// Generate a specified number of mock logs
export const generateMockLogs = (count: number): LogEntry[] => {
  const logs: LogEntry[] = [];

  for (let i = 0; i < count; i++) {
    logs.push(generateLogEntry());
  }

  // Sort by timestamp desc (newest first)
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Generate mock alerts (already implemented elsewhere)
export const generateMockAlerts = (count: number) => {
  // Placeholder for existing mock alert generation
  // This function would be implemented elsewhere
  return [];
};

// Compliance data generation

// Common compliance frameworks
const complianceFrameworks = [
  {
    name: "NIST Cybersecurity Framework",
    description:
      "Cybersecurity framework by the National Institute of Standards and Technology.",
    version: "1.1",
    controlCount: 108,
    requirements: [
      "Identify, protect, detect, respond, and recover functions",
      "Continuous monitoring and real-time assessments",
      "Risk management approach",
      "Protection of critical assets",
      "Response and recovery planning",
    ],
  },
  {
    name: "ISO 27001",
    description:
      "Information security standard that provides requirements for information security management systems.",
    version: "2022",
    controlCount: 114,
    requirements: [
      "Information security policies",
      "Organization of information security",
      "Human resources security",
      "Asset management",
      "Access control",
      "Cryptography",
      "Physical and environmental security",
      "Operations security",
    ],
  },
  {
    name: "PCI DSS",
    description:
      "Payment Card Industry Data Security Standard for organizations that handle credit cards.",
    version: "4.0",
    controlCount: 78,
    requirements: [
      "Secure network and systems",
      "Protect cardholder data",
      "Vulnerability management program",
      "Strong access control measures",
      "Monitor and test networks",
      "Information security policy",
    ],
  },
  {
    name: "HIPAA",
    description:
      "Health Insurance Portability and Accountability Act - US healthcare data privacy and security.",
    version: "2021",
    controlCount: 54,
    requirements: [
      "Privacy Rule",
      "Security Rule",
      "Breach Notification Rule",
      "Enforcement Rule",
      "Omnibus Rule",
    ],
  },
  {
    name: "GDPR",
    description:
      "General Data Protection Regulation - EU data protection and privacy regulation.",
    version: "2018",
    controlCount: 87,
    requirements: [
      "Lawfulness, fairness and transparency",
      "Purpose limitation",
      "Data minimization",
      "Accuracy",
      "Storage limitation",
      "Integrity and confidentiality",
      "Accountability",
      "Data subject rights",
    ],
  },
  {
    name: "SOC 2",
    description:
      "Service Organization Control 2 - Focuses on information security policies and procedures.",
    version: "2017",
    controlCount: 64,
    requirements: [
      "Security",
      "Availability",
      "Processing Integrity",
      "Confidentiality",
      "Privacy",
    ],
  },
];

// Compliance control categories
const controlCategories = {
  "NIST Cybersecurity Framework": [
    "Identify",
    "Protect",
    "Detect",
    "Respond",
    "Recover",
  ],
  "ISO 27001": [
    "Security Policy",
    "Organization",
    "Asset Management",
    "HR Security",
    "Physical Security",
    "Communications",
    "Access Control",
    "Development",
  ],
  "PCI DSS": [
    "Network Security",
    "Data Protection",
    "Vulnerability Management",
    "Access Control",
    "Monitoring",
    "Policy",
  ],
  HIPAA: [
    "Privacy Rule",
    "Security Rule",
    "Breach Notification Rule",
    "Enforcement Rule",
    "Omnibus Rule",
  ],
  GDPR: [
    "Lawfulness",
    "Data Rights",
    "Privacy Measures",
    "Documentation",
    "Data Transfer",
    "Security Measures",
  ],
  "SOC 2": [
    "Security",
    "Availability",
    "Processing Integrity",
    "Confidentiality",
    "Privacy",
  ],
};

// Control descriptions for generating realistic controls
const controlDescriptions = {
  Identify: [
    "Asset inventory management",
    "Business environment analysis",
    "Governance policies and procedures",
    "Risk assessment",
    "Risk management strategy",
  ],
  Protect: [
    "Access control implementation",
    "Security awareness training",
    "Data security protection",
    "Information protection processes",
    "Protective technology deployment",
  ],
  Detect: [
    "Anomalies and events detection",
    "Continuous security monitoring",
    "Detection processes implementation",
  ],
  Respond: [
    "Response planning",
    "Communications protocols",
    "Analysis procedures",
    "Mitigation actions",
    "Improvements implementation",
  ],
  Recover: [
    "Recovery planning",
    "Recovery strategy improvements",
    "Communications coordination",
  ],
  "Security Policy": [
    "Information security policy documentation",
    "Policy review process",
    "Security roles and responsibilities",
  ],
  "Network Security": [
    "Firewall configuration",
    "Secure network architecture",
    "Network segmentation implementation",
  ],
  "Data Protection": [
    "Data encryption requirements",
    "Data classification policy",
    "Data retention and disposal",
  ],
  "Privacy Rule": [
    "Patient rights implementation",
    "Notice of privacy practices",
    "Administrative requirements",
  ],
  "Security Rule": [
    "Administrative safeguards",
    "Physical safeguards",
    "Technical safeguards",
  ],
};

// Generate a random compliance status
const generateStatus = ():
  | "compliant"
  | "non-compliant"
  | "partially-compliant"
  | "pending" => {
  const rand = Math.random();
  if (rand < 0.25) return "compliant";
  if (rand < 0.5) return "partially-compliant";
  if (rand < 0.75) return "non-compliant";
  return "pending";
};

// Generate a random priority
const generatePriority = (): "critical" | "high" | "medium" | "low" => {
  const rand = Math.random();
  if (rand < 0.15) return "critical";
  if (rand < 0.4) return "high";
  if (rand < 0.7) return "medium";
  return "low";
};

// Generate mock compliance data
export const generateMockComplianceData = () => {
  const frameworks: ComplianceFramework[] = [];
  const audits: ComplianceAudit[] = [];

  // Generate frameworks with controls
  complianceFrameworks.forEach((framework, index) => {
    const controls: ComplianceControl[] = [];
    const categories = controlCategories[framework.name] || ["General"];

    // Generate controls based on the controlCount in the framework
    const controlCount =
      framework.controlCount || Math.floor(Math.random() * 20) + 10;

    for (let i = 0; i < controlCount; i++) {
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const controlId = `${framework.name
        .substring(0, 3)
        .toUpperCase()}-${category.substring(0, 3).toUpperCase()}-${String(
        i + 1
      ).padStart(3, "0")}`;

      // Get descriptions relevant to the category if available
      const categoryDescriptions = controlDescriptions[category] || [
        "Controls implementation",
        "Policies and procedures",
        "Technical safeguards",
      ];
      const descriptionText =
        categoryDescriptions[
          Math.floor(Math.random() * categoryDescriptions.length)
        ];

      // Generate a more specific title based on the category and description
      const titlePrefix = Math.random() > 0.5 ? "Implement" : "Establish";
      const titleText = `${titlePrefix} ${descriptionText.toLowerCase()} for ${category.toLowerCase()}`;

      // Generate specific requirements based on the description
      const requirementVerbs = [
        "must implement",
        "shall establish",
        "is required to maintain",
        "should document",
      ];
      const requirementVerb =
        requirementVerbs[Math.floor(Math.random() * requirementVerbs.length)];
      const requirementText = `The organization ${requirementVerb} ${descriptionText.toLowerCase()} according to ${
        framework.name
      } standards. This includes regular review and updates to ensure continued compliance.`;

      // More realistic evidence examples
      const evidenceOptions = [
        "Policy documentation",
        "System configuration screenshots",
        "Audit logs",
        "Training records",
        "Third-party assessment report",
        "Vulnerability scan results",
        "Access control matrices",
        "Data flow diagrams",
        "Risk assessment documentation",
        "Incident response procedures",
        "Backup verification logs",
        "Change management records",
      ];

      // Select 2-4 random evidence items
      const evidenceCount = Math.floor(Math.random() * 3) + 2;
      const evidence = [];
      for (let j = 0; j < evidenceCount; j++) {
        const randomEvidence =
          evidenceOptions[Math.floor(Math.random() * evidenceOptions.length)];
        if (!evidence.includes(randomEvidence)) {
          evidence.push(randomEvidence);
        }
      }

      // Determine realistic control status and score
      const statusRandom = Math.random();
      let status:
        | "compliant"
        | "non-compliant"
        | "partially-compliant"
        | "pending";
      let score: number;

      if (statusRandom < 0.4) {
        status = "compliant";
        score = Math.floor(Math.random() * 16) + 85; // 85-100
      } else if (statusRandom < 0.7) {
        status = "partially-compliant";
        score = Math.floor(Math.random() * 25) + 60; // 60-84
      } else if (statusRandom < 0.9) {
        status = "non-compliant";
        score = Math.floor(Math.random() * 30) + 30; // 30-59
      } else {
        status = "pending";
        score = 0;
      }

      // Generate remediation plan if not compliant
      let remediationPlan: string | undefined;
      if (status !== "compliant") {
        const remediationOptions = [
          `Update the ${category.toLowerCase()} policies and procedures to meet current standards`,
          `Implement additional ${descriptionText.toLowerCase()} controls`,
          `Conduct staff training on ${category.toLowerCase()} requirements`,
          `Perform a gap analysis of existing ${category.toLowerCase()} controls`,
          `Engage third-party consultant to review ${category.toLowerCase()} implementation`,
        ];
        remediationPlan =
          remediationOptions[
            Math.floor(Math.random() * remediationOptions.length)
          ];
      }

      // Possible owners with job titles
      const owners = [
        "John Smith (CISO)",
        "Sarah Johnson (Compliance Manager)",
        "David Lee (IT Director)",
        "Maria Garcia (Security Analyst)",
        "Robert Chen (Risk Manager)",
        "Emily Wilson (IT Security Lead)",
      ];

      // Create control
      controls.push({
        id: uuidv4(),
        frameworkId: `framework-${index}`,
        category,
        controlId,
        title: titleText,
        description: `This control ensures that ${descriptionText.toLowerCase()} are properly implemented and maintained for effective ${category.toLowerCase()}.`,
        requirement: requirementText,
        status,
        evidence: status !== "pending" ? evidence : undefined,
        score,
        lastAssessed: randomDate(),
        remediationPlan,
        owner:
          Math.random() > 0.3
            ? owners[Math.floor(Math.random() * owners.length)]
            : undefined,
        dueDate:
          status !== "compliant" && status !== "pending"
            ? addDays(new Date(), Math.floor(Math.random() * 90) + 30)
            : undefined,
        priority: generatePriority(),
      });
    }

    // Calculate overall score based on control scores
    const overallScore =
      controls.reduce((acc, control) => acc + control.score, 0) /
      controls.length;

    // Determine framework status based on overall score
    let status:
      | "compliant"
      | "non-compliant"
      | "partially-compliant"
      | "pending";
    if (overallScore >= 85) {
      status = "compliant";
    } else if (overallScore >= 60) {
      status = "partially-compliant";
    } else if (overallScore >= 30) {
      status = "non-compliant";
    } else {
      status = "pending";
    }

    frameworks.push({
      id: `framework-${index}`,
      name: framework.name,
      description: framework.description,
      version: framework.version,
      controls,
      overallScore,
      lastUpdated: randomDate(),
      nextAuditDate: addDays(new Date(), Math.floor(Math.random() * 90) + 30),
      status,
    });

    // Generate 1-3 audits per framework
    const auditCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < auditCount; i++) {
      const startDate = subDays(
        new Date(),
        Math.floor(Math.random() * 180) + 30
      );
      const endDate = addDays(startDate, Math.floor(Math.random() * 14) + 7);

      const status: "scheduled" | "in-progress" | "completed" | "archived" =
        startDate > new Date()
          ? "scheduled"
          : endDate > new Date()
          ? "in-progress"
          : endDate < subDays(new Date(), 90)
          ? "archived"
          : "completed";

      // Generate score based on audit status
      const score =
        status === "scheduled" ? 0 : Math.floor(Math.random() * 100);

      // Generate more specific audit findings
      const findingsOptions = [
        "Documentation for some controls is outdated and needs review",
        "Missing evidence for compliance with specific requirements",
        "Incomplete risk assessment documentation",
        "Inadequate access control mechanisms",
        "Insufficient security awareness training",
        "Lack of formal incident response procedures",
        "Improper data retention practices",
        "Weak encryption standards in use",
        "Unclear roles and responsibilities",
        "Inconsistent change management process",
      ];

      // Select random findings if not scheduled
      const findings: string[] = [];
      if (status !== "scheduled" && Math.random() > 0.3) {
        const findingCount = Math.floor(Math.random() * 4) + 1;
        for (let j = 0; j < findingCount; j++) {
          const finding =
            findingsOptions[Math.floor(Math.random() * findingsOptions.length)];
          if (!findings.includes(finding)) {
            findings.push(finding);
          }
        }
      }

      // Create audit
      audits.push({
        id: uuidv4(),
        frameworkId: `framework-${index}`,
        title: `${framework.name} Compliance Audit ${new Date(
          startDate
        ).getFullYear()} Q${
          Math.floor(new Date(startDate).getMonth() / 3) + 1
        }`,
        status,
        startDate,
        endDate,
        auditor: [
          "Internal Audit Team",
          "External Auditor (PwC)",
          "Compliance Officer",
          "Security Assessment Team",
          "Third-party Assessor (Deloitte)",
        ][Math.floor(Math.random() * 5)],
        findings,
        score,
        reportUrl:
          status === "completed" || status === "archived" ? "#" : undefined,
      });
    }
  });

  return { frameworks, audits };
};

// Vulnerability data generation

// Vulnerability categories
const vulnerabilityCategories = [
  "SQL Injection",
  "Cross-Site Scripting (XSS)",
  "Cross-Site Request Forgery (CSRF)",
  "Server Misconfiguration",
  "Outdated Software",
  "Weak Passwords",
  "Authentication Bypass",
  "Insecure File Upload",
  "Remote Code Execution",
  "Buffer Overflow",
  "SSL/TLS Vulnerability",
  "Default Configuration",
  "Directory Traversal",
  "Privilege Escalation",
];

// Vulnerability tags
const vulnerabilityTags = [
  "web-application",
  "network",
  "database",
  "authentication",
  "encryption",
  "server",
  "api",
  "frontend",
  "backend",
  "cloud",
  "container",
  "mobile",
  "windows",
  "linux",
  "macos",
  "cve",
  "zero-day",
  "public-exploit",
];

// Common vulnerable systems
const vulnerableSystems = [
  "Web Server",
  "Database Server",
  "Application Server",
  "Load Balancer",
  "Firewall",
  "Domain Controller",
  "User Workstation",
  "Container Host",
  "API Gateway",
  "Kubernetes Cluster",
  "Legacy Application",
  "Network Switch",
  "VPN Endpoint",
  "Cloud Storage",
  "IoT Device",
];

// Scan targets
const scanTargets = [
  "192.168.1.0/24",
  "10.0.0.0/16",
  "https://example.com",
  "backend-servers",
  "database-tier",
];

// Network protocols
const networkProtocols = [
  "TCP",
  "UDP",
  "HTTP",
  "HTTPS",
  "DNS",
  "ICMP",
  "SMTP",
  "SSH",
  "FTP",
  "SNMP",
];

// Traffic statuses
const trafficStatuses = ["allowed", "blocked", "suspicious"];

// Alert types
const alertTypes = [
  "intrusion",
  "malware",
  "data_loss",
  "policy_violation",
  "anomaly",
];

// Alert severities
const alertSeverities = ["critical", "high", "medium", "low", "info"];

// Generate a MAC address
const generateMac = () => {
  const hexDigits = "0123456789ABCDEF";
  let mac = "";
  for (let i = 0; i < 6; i++) {
    let part = "";
    for (let j = 0; j < 2; j++) {
      part += hexDigits.charAt(Math.floor(Math.random() * hexDigits.length));
    }
    mac += (i === 0 ? "" : ":") + part;
  }
  return mac;
};

// Generate network devices
const generateNetworkDevices = (): NetworkDevice[] => {
  const devices: NetworkDevice[] = [];
  const deviceCount = Math.floor(Math.random() * 20) + 15; // 15-35 devices

  // Generate subnet prefixes for IP addresses
  const subnets = ["192.168.1", "10.0.0", "172.16.1", "10.10.10"];

  // Keep track of used IPs to avoid duplicates
  const usedIps = new Set<string>();

  // Possible locations
  const locations = ["HQ", "Branch Office", "Data Center", "Remote Site", "Cloud"];
  
  // Possible owners
  const owners = ["IT Department", "Sales", "Marketing", "Engineering", "Executive"];

  for (let i = 0; i < deviceCount; i++) {
    // Generate a unique IP address
    let ip = "";
    do {
      const subnet = subnets[Math.floor(Math.random() * subnets.length)];
      ip = `${subnet}.${Math.floor(Math.random() * 254) + 1}`;
    } while (usedIps.has(ip));
    usedIps.add(ip);

    // Generate a random MAC address
    const mac = generateMac();

    // Generate a random device type
    const deviceTypes = [
      "router",
      "switch",
      "firewall",
      "server",
      "workstation",
      "printer",
      "scanner",
    ];
    const type = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];

    // Generate a random device name
    const name = `${type}-${Math.floor(Math.random() * 1000)}`;
    
    // Generate random status
    const statusOptions: ["online", "offline", "warning"] = ["online", "offline", "warning"];
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    
    // Generate random services
    const possibleServices = ["HTTP", "HTTPS", "SSH", "FTP", "DNS", "SMTP", "SMB", "RDP", "Telnet"];
    const serviceCount = Math.floor(Math.random() * 4) + 1; // 1-4 services
    const services: string[] = [];
    
    for (let j = 0; j < serviceCount; j++) {
      const service = possibleServices[Math.floor(Math.random() * possibleServices.length)];
      if (!services.includes(service)) {
        services.push(service);
      }
    }
    
    // Generate random tags
    const possibleTags = ["critical", "production", "development", "testing", "backup", "security", "monitoring"];
    const tagCount = Math.floor(Math.random() * 3); // 0-2 tags
    const tags: string[] = [];
    
    for (let j = 0; j < tagCount; j++) {
      const tag = possibleTags[Math.floor(Math.random() * possibleTags.length)];
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }

    // Create the device that matches the NetworkDevice interface
    devices.push({
      id: uuidv4(),
      name,
      ip,
      mac,
      type,
      status,
      lastSeen: randomDate(),
      os: ["Windows", "Linux", "macOS", "iOS", "Android"][Math.floor(Math.random() * 5)],
      location: Math.random() > 0.3 ? locations[Math.floor(Math.random() * locations.length)] : undefined,
      owner: Math.random() > 0.5 ? owners[Math.floor(Math.random() * owners.length)] : undefined,
      services,
      trafficIn: Math.floor(Math.random() * 1000) + 100, // 100-1100 MB
      trafficOut: Math.floor(Math.random() * 800) + 50, // 50-850 MB
      riskScore: Math.floor(Math.random() * 100), // 0-100
      tags
    });
  }

  return devices;
};

// Generate mock vulnerability data
const generateMockVulnerabilityData = (): {
  vulnerabilities: any[];
  scanResults: any[];
} => {
  // Initialize arrays for vulnerabilities and scan results
  const vulnerabilities: any[] = [];
  const scanResults: any[] = [];

  // Generate vulnerabilities
  const numVulnerabilities = Math.floor(Math.random() * 50) + 50;

  for (let i = 0; i < numVulnerabilities; i++) {
    const severity: "critical" | "high" | "medium" | "low" | "info" = (() => {
      const rand = Math.random();
      if (rand < 0.1) return "critical";
      if (rand < 0.3) return "high";
      if (rand < 0.6) return "medium";
      if (rand < 0.9) return "low";
      return "info";
    })();

    const status:
      | "open"
      | "in-progress"
      | "resolved"
      | "accepted"
      | "false-positive" = (() => {
      const rand = Math.random();
      if (rand < 0.5) return "open";
      if (rand < 0.7) return "in-progress";
      if (rand < 0.9) return "resolved";
      if (rand < 0.95) return "accepted";
      return "false-positive";
    })();

    const category =
      vulnerabilityCategories[
        Math.floor(Math.random() * vulnerabilityCategories.length)
      ];

    // Generate CVSS score appropriate for the severity
    let cvssScore = 0;
    if (severity === "critical") cvssScore = Math.random() * 2 + 8; // 8.0-10.0
    else if (severity === "high") cvssScore = Math.random() * 2 + 6; // 6.0-8.0
    else if (severity === "medium")
      cvssScore = Math.random() * 2 + 4; // 4.0-6.0
    else if (severity === "low") cvssScore = Math.random() * 2 + 2; // 2.0-4.0
    else cvssScore = Math.random() * 2; // 0.0-2.0

    cvssScore = parseFloat(cvssScore.toFixed(1));

    // Generate random affected systems
    const systemsAffectedCount = Math.floor(Math.random() * 3) + 1;
    const affected: string[] = [];
    for (let j = 0; j < systemsAffectedCount; j++) {
      const system =
        vulnerableSystems[Math.floor(Math.random() * vulnerableSystems.length)];
      if (!affected.includes(system)) {
        affected.push(system);
      }
    }

    // Generate random tags
    const tagsCount = Math.floor(Math.random() * 4) + 1;
    const tags: string[] = [];
    for (let j = 0; j < tagsCount; j++) {
      const tag =
        vulnerabilityTags[Math.floor(Math.random() * vulnerabilityTags.length)];
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }

    // Simulate a CVE ID for some vulnerabilities
    const hasCve = Math.random() > 0.3;
    const cveId = hasCve
      ? `CVE-${2022 + Math.floor(Math.random() * 3)}-${Math.floor(
          Math.random() * 10000
        )
          .toString()
          .padStart(4, "0")}`
      : undefined;

    // Create the vulnerability object
    const vulnerability: Vulnerability = {
      id: uuidv4(),
      title: `${category} Vulnerability in ${affected[0]}`,
      description: `A ${severity} severity ${category.toLowerCase()} vulnerability was detected in ${affected.join(
        ", "
      )}. This could allow attackers to ${
        severity === "critical" || severity === "high"
          ? "compromise the system and gain unauthorized access"
          : "potentially affect system stability or information disclosure"
      }.`,
      severity,
      status,
      cvssScore,
      cveId,
      affected,
      discoveredDate: subDays(new Date(), Math.floor(Math.random() * 90)),
      lastUpdated: subDays(new Date(), Math.floor(Math.random() * 30)),
      dueDate:
        status === "open" || status === "in-progress"
          ? addDays(new Date(), Math.floor(Math.random() * 30) + 1)
          : undefined,
      remediation:
        status !== "open"
          ? `Apply security patch and update ${affected[0]} to the latest version. Implement input validation and sanitization.`
          : undefined,
      assignedTo:
        status === "in-progress"
          ? ["John Smith", "Alice Johnson", "David Chen", "Sarah Wilson"][
              Math.floor(Math.random() * 4)
            ]
          : undefined,
      category,
      tags,
      systemsAffected: Math.floor(Math.random() * 10) + 1,
      exploitAvailable:
        severity === "critical" || (severity === "high" && Math.random() > 0.7),
      patchAvailable: Math.random() > 0.2,
      reportedBy: [
        "Automated Scan",
        "Security Team",
        "External Audit",
        "Penetration Test",
      ][Math.floor(Math.random() * 4)],
    };

    vulnerabilities.push(vulnerability);
  }

  // Generate scan results
  const numScans = 12;
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - numScans + 1);

  for (let i = 0; i < numScans; i++) {
    const scanDate = new Date(startDate);
    scanDate.setMonth(scanDate.getMonth() + i);

    scanResults.push({
      id: uuidv4(),
      scanDate,
      vulnerabilityCount: Math.floor(Math.random() * 20) + 30,
      fixedCount: Math.floor(Math.random() * 15),
      criticalCount: Math.floor(Math.random() * 5),
      highCount: Math.floor(Math.random() * 10) + 5,
      mediumCount: Math.floor(Math.random() * 15) + 10,
      lowCount: Math.floor(Math.random() * 10) + 5,
    });
  }

  // Sort scan results by date
  scanResults.sort(
    (a: any, b: any) => a.scanDate.getTime() - b.scanDate.getTime()
  );

  return { vulnerabilities, scanResults };
};

// Generate network traffic data
const generateNetworkTraffic = (devices: NetworkDevice[] = []) => {
  const trafficData: TrafficData[] = [];
  const now = new Date();
  const protocols = ["TCP", "UDP", "HTTP", "HTTPS", "DNS", "SMTP", "SSH", "FTP"];
  const statusOptions: ["allowed", "blocked", "suspicious"] = ["allowed", "blocked", "suspicious"];
  const serviceNames = ["Web Server", "Email", "File Transfer", "Database", "DNS Lookup", "Authentication"];
  
  // If no devices provided, generate some generic device IDs
  const deviceIds = devices.length > 0 
    ? devices.map(device => device.id)
    : Array(5).fill(0).map(() => uuidv4());

  // Generate traffic entries (50-100 entries)
  const entryCount = Math.floor(Math.random() * 50) + 50;
  
  for (let i = 0; i < entryCount; i++) {
    const timestamp = new Date(now);
    // Random time within the last 24 hours
    timestamp.setTime(now.getTime() - (Math.random() * 24 * 60 * 60 * 1000));
    
    // Random source and destination IPs
    const sourceIp = `192.168.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 254) + 1}`;
    const destinationIp = `10.0.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 254) + 1}`;
    
    // Random ports
    const sourcePort = Math.floor(Math.random() * 65000) + 1024; // Non-system ports
    const destinationPort = Math.floor(Math.random() * 1000) + 1; // Common service ports
    
    // Random protocol
    const protocol = protocols[Math.floor(Math.random() * protocols.length)];
    
    // Random traffic size (10KB to 10MB)
    const bytesTransferred = Math.floor(Math.random() * 10000000) + 10000;
    
    // Random packet count
    const packetsTransferred = Math.floor(bytesTransferred / (Math.floor(Math.random() * 1000) + 500));
    
    // Random duration (1ms to 5s)
    const duration = Math.floor(Math.random() * 5000) + 1;
    
    // Random status
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    
    // Random device ID from the provided list
    const deviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)];
    
    // Random service name (optional - 70% chance)
    const serviceName = Math.random() > 0.3 
      ? serviceNames[Math.floor(Math.random() * serviceNames.length)]
      : undefined;
    
    trafficData.push({
      id: uuidv4(),
      timestamp,
      sourceIp,
      sourcePort,
      destinationIp,
      destinationPort,
      protocol,
      bytesTransferred,
      packetsTransferred,
      duration,
      status,
      deviceId,
      serviceName
    });
  }

  return trafficData.sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );
};

// Generate network alerts
const generateNetworkAlerts = (devices: NetworkDevice[] = []): NetworkAlert[] => {
  const alerts: NetworkAlert[] = [];
  const now = new Date();
  const alertTypes = [
    "Unauthorized access attempt",
    "DDoS attack detected",
    "Unusual traffic pattern",
    "Port scanning detected",
    "Malware communication detected",
    "Data exfiltration attempt",
    "Suspicious login activity",
    "Firewall rule violation",
    "Network scan detected",
    "Brute force attempt"
  ];

  // Possible actions
  const actions = ["Block traffic", "Isolate device", "Investigate", "Monitor", "Update firewall rules", "Apply security patch"];
  
  // Protocols
  const protocols = ["TCP", "UDP", "HTTP", "HTTPS", "DNS", "SMTP", "SSH", "FTP"];
  
  // If no devices provided, generate some generic device IDs
  const deviceIds = devices.length > 0 
    ? devices.map(device => device.id)
    : Array(5).fill(0).map(() => uuidv4());
  
  // Generate a random number of alerts (5-15)
  const numAlerts = Math.floor(Math.random() * 10) + 5;

  for (let i = 0; i < numAlerts; i++) {
    // Random severity with weighted distribution
    const severityRoll = Math.random();
    let severity: "critical" | "high" | "medium" | "low";
    
    if (severityRoll < 0.1) { // 10% critical
      severity = "critical";
    } else if (severityRoll < 0.3) { // 20% high
      severity = "high";
    } else if (severityRoll < 0.6) { // 30% medium
      severity = "medium";
    } else { // 40% low
      severity = "low";
    }
    
    // Random timestamp within the last 72 hours
    const timestamp = new Date(now);
    timestamp.setTime(now.getTime() - (Math.random() * 72 * 60 * 60 * 1000)); // Within last 72 hours
    
    // Random source and destination IPs
    const sourceIp = `192.168.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 254) + 1}`;
    const destinationIp = `10.0.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 254) + 1}`;
    
    // Random protocol
    const protocol = protocols[Math.floor(Math.random() * protocols.length)];
    
    // Random device ID
    const deviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)];
    
    // Random status with weighted distribution
    const status: "active" | "investigating" | "resolved" | "false_positive" = 
      Math.random() < 0.5 ? "active" : 
      Math.random() < 0.7 ? "investigating" : 
      Math.random() < 0.9 ? "resolved" : 
      "false_positive";
    
    // Random recommended action (80% chance to have one)
    const recommendedAction = Math.random() < 0.8 ? 
      actions[Math.floor(Math.random() * actions.length)] : 
      undefined;
    
    // Alert details
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    
    // Generate details based on alert type
    let details = ``;
    
    switch (alertType) {
      case "Unauthorized access attempt":
        details = `Failed login attempts from ${sourceIp} to service on ${destinationIp}. ${Math.floor(Math.random() * 10) + 3} attempts detected.`;
        break;
      case "DDoS attack detected":
        details = `Unusual traffic volume (${Math.floor(Math.random() * 1000) + 500} Mbps) detected targeting ${destinationIp}.`;
        break;
      case "Port scanning detected":
        details = `${sourceIp} scanned ${Math.floor(Math.random() * 50) + 10} ports on ${destinationIp} in ${Math.floor(Math.random() * 5) + 1} minutes.`;
        break;
      default:
        details = `${alertType} involving ${sourceIp} and ${destinationIp} over ${protocol} protocol.`;
    }
    
    alerts.push({
      id: uuidv4(),
      timestamp,
      deviceId,
      type: alertType,
      severity,
      sourceIp,
      destinationIp,
      protocol,
      status,
      details,
      recommendedAction
    });
  }

  // Sort by timestamp (newest first)
  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Using the generateMac function defined earlier

// Export all the functions needed for the application
const mockDataUtils = {
  generateLogEntry,
  generateMockLogs,
  generateMockAlerts,
  generateMockComplianceData,
  generateMockVulnerabilityData,
  generateNetworkDevices,
  generateNetworkTraffic,
  generateNetworkAlerts,
};

export default mockDataUtils;
