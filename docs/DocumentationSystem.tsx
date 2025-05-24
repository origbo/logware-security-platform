/**
 * Documentation System Component
 * 
 * A comprehensive documentation system for the security platform
 * with search, navigation, and versioning capabilities.
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandLess,
  ExpandMore,
  Description as DocumentIcon,
  Book as BookIcon,
  Code as CodeIcon,
  Architecture as ArchitectureIcon,
  Settings as SettingsIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  FolderOpen as FolderIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

// Documentation types
export interface DocPage {
  id: string;
  title: string;
  path: string;
  content: string;
  section: string;
  subsection?: string;
  tags: string[];
  lastUpdated: string;
  version: string;
  contributors: string[];
}

export interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  pages: DocPage[];
  subsections?: {
    id: string;
    title: string;
    pages: DocPage[];
  }[];
}

// Sample documentation data
const DOCUMENTATION_DATA: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <HomeIcon />,
    pages: [
      {
        id: 'introduction',
        title: 'Introduction',
        path: '/docs/getting-started/introduction',
        content: `# Introduction to the Security Platform

The Logware Security Platform is a comprehensive security solution designed to help organizations monitor, detect, and respond to security threats across their infrastructure.

## Key Features

* Real-time security monitoring
* Advanced threat detection
* Automated incident response
* Compliance management
* Vulnerability assessment

## Who is it for?

This platform is designed for security teams of all sizes, from small businesses to enterprise organizations. Whether you're a security analyst, SOC manager, or CISO, the platform provides the tools you need to protect your organization.

## Getting Started

To get started with the platform, follow these steps:

1. Set up your organization profile
2. Connect your data sources
3. Configure detection rules
4. Set up alerts and notifications
5. Explore the dashboard

For more detailed instructions, check out the [Quick Start Guide](/docs/getting-started/quick-start).`,
        section: 'Getting Started',
        tags: ['overview', 'introduction', 'basics'],
        lastUpdated: '2025-04-15',
        version: '1.0.0',
        contributors: ['John Smith', 'Jane Doe']
      },
      {
        id: 'quick-start',
        title: 'Quick Start Guide',
        path: '/docs/getting-started/quick-start',
        content: '# Quick Start Guide\n\nThis guide will help you quickly set up and start using the security platform...',
        section: 'Getting Started',
        tags: ['setup', 'configuration', 'basics'],
        lastUpdated: '2025-04-16',
        version: '1.0.0',
        contributors: ['John Smith']
      }
    ]
  },
  {
    id: 'user-guide',
    title: 'User Guide',
    icon: <BookIcon />,
    pages: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        path: '/docs/user-guide/dashboard',
        content: '# Dashboard\n\nThe dashboard provides an overview of your security posture...',
        section: 'User Guide',
        tags: ['ui', 'dashboard', 'metrics'],
        lastUpdated: '2025-04-15',
        version: '1.0.0',
        contributors: ['Jane Doe']
      }
    ],
    subsections: [
      {
        id: 'alerts',
        title: 'Alerts',
        pages: [
          {
            id: 'alert-management',
            title: 'Alert Management',
            path: '/docs/user-guide/alerts/alert-management',
            content: '# Alert Management\n\nThis section covers how to manage security alerts...',
            section: 'User Guide',
            subsection: 'Alerts',
            tags: ['alerts', 'management', 'triage'],
            lastUpdated: '2025-04-17',
            version: '1.0.0',
            contributors: ['John Smith', 'Jane Doe']
          }
        ]
      }
    ]
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: <CodeIcon />,
    pages: [
      {
        id: 'api-overview',
        title: 'API Overview',
        path: '/docs/api-reference/overview',
        content: '# API Overview\n\nThe Security Platform API allows you to integrate with and extend the platform...',
        section: 'API Reference',
        tags: ['api', 'integration', 'development'],
        lastUpdated: '2025-04-18',
        version: '1.0.0',
        contributors: ['Alex Johnson']
      }
    ]
  },
  {
    id: 'architecture',
    title: 'Architecture',
    icon: <ArchitectureIcon />,
    pages: [
      {
        id: 'system-architecture',
        title: 'System Architecture',
        path: '/docs/architecture/system-architecture',
        content: '# System Architecture\n\nThis document describes the overall architecture of the security platform...',
        section: 'Architecture',
        tags: ['architecture', 'design', 'technical'],
        lastUpdated: '2025-04-19',
        version: '1.0.0',
        contributors: ['Alex Johnson', 'Sarah Williams']
      }
    ]
  }
];

export const DocumentationSystem: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPage, setSelectedPage] = useState<DocPage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [bookmarkedPages, setBookmarkedPages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('document');
  
  // Load initial page
  useEffect(() => {
    // Load the introduction page by default
    const introPage = DOCUMENTATION_DATA[0].pages[0];
    setSelectedPage(introPage);
  }, []);
  
  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Handle section expansion
  const handleSectionToggle = (sectionId: string) => {
    setExpandedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };
  
  // Handle page selection
  const handlePageSelect = (page: DocPage) => {
    setLoading(true);
    
    // Simulate page loading
    setTimeout(() => {
      setSelectedPage(page);
      setLoading(false);
      
      // Close drawer on mobile after selection
      if (isMobile) {
        setDrawerOpen(false);
      }
    }, 300);
  };
  
  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle bookmark toggle
  const handleBookmarkToggle = (pageId: string) => {
    setBookmarkedPages(prev => {
      if (prev.includes(pageId)) {
        return prev.filter(id => id !== pageId);
      } else {
        return [...prev, pageId];
      }
    });
  };
  
  // Handle tab change
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setActiveTab(newValue);
  };
  
  // Get all pages for search
  const allPages = DOCUMENTATION_DATA.flatMap(section => {
    const sectionPages = section.pages || [];
    const subsectionPages = section.subsections?.flatMap(subsection => subsection.pages) || [];
    return [...sectionPages, ...subsectionPages];
  });
  
  // Filter pages by search query
  const filteredPages = searchQuery
    ? allPages.filter(page => 
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];
  
  // Generate breadcrumbs
  const generateBreadcrumbs = (page: DocPage) => {
    const breadcrumbs = [
      { text: 'Documentation', href: '/docs' },
      { text: page.section, href: `/docs/${page.section.toLowerCase().replace(/\s+/g, '-')}` }
    ];
    
    if (page.subsection) {
      breadcrumbs.push({
        text: page.subsection,
        href: `/docs/${page.section.toLowerCase().replace(/\s+/g, '-')}/${page.subsection.toLowerCase().replace(/\s+/g, '-')}`
      });
    }
    
    breadcrumbs.push({ text: page.title, href: page.path });
    
    return breadcrumbs;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  // Render document content
  // In a real implementation, this would use a Markdown or MDX renderer
  const renderDocumentContent = (content: string) => {
    // This is a simplified renderer for demonstration
    const lines = content.split('\n');
    
    return (
      <Box>
        {lines.map((line, index) => {
          if (line.startsWith('# ')) {
            return (
              <Typography key={index} variant="h4" gutterBottom>
                {line.substring(2)}
              </Typography>
            );
          } else if (line.startsWith('## ')) {
            return (
              <Typography key={index} variant="h5" gutterBottom sx={{ mt: 3 }}>
                {line.substring(3)}
              </Typography>
            );
          } else if (line.startsWith('### ')) {
            return (
              <Typography key={index} variant="h6" gutterBottom sx={{ mt: 2 }}>
                {line.substring(4)}
              </Typography>
            );
          } else if (line.startsWith('* ')) {
            return (
              <Box key={index} sx={{ display: 'flex', ml: 2, mb: 1 }}>
                <Typography variant="body1" sx={{ mr: 1 }}>•</Typography>
                <Typography variant="body1">
                  {line.substring(2)}
                </Typography>
              </Box>
            );
          } else if (line.match(/^\d+\./)) {
            const number = line.match(/^\d+/)?.[0] || '';
            return (
              <Box key={index} sx={{ display: 'flex', ml: 2, mb: 1 }}>
                <Typography variant="body1" sx={{ mr: 1, minWidth: 20 }}>{number}.</Typography>
                <Typography variant="body1">
                  {line.substring(number.length + 1).trim()}
                </Typography>
              </Box>
            );
          } else if (line.trim() === '') {
            return <Box key={index} sx={{ height: 16 }} />;
          } else {
            return (
              <Typography key={index} variant="body1" paragraph>
                {line}
              </Typography>
            );
          }
        })}
      </Box>
    );
  };
  
  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Documentation Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            top: 64,
            height: 'calc(100% - 64px)'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search documentation..."
            size="small"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <Divider />
        
        {searchQuery ? (
          <List sx={{ px: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2, mb: 1 }}>
              Search Results ({filteredPages.length})
            </Typography>
            
            {filteredPages.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
                No results found for "{searchQuery}"
              </Typography>
            ) : (
              filteredPages.map(page => (
                <ListItem 
                  key={page.id} 
                  disablePadding 
                  sx={{ mb: 0.5 }}
                >
                  <ListItemButton
                    dense
                    onClick={() => handlePageSelect(page)}
                    selected={selectedPage?.id === page.id}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <DocumentIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={page.title} />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        ) : (
          <List>
            {DOCUMENTATION_DATA.map(section => (
              <React.Fragment key={section.id}>
                <ListItem 
                  disablePadding 
                  sx={{ display: 'block' }}
                >
                  <ListItemButton
                    onClick={() => handleSectionToggle(section.id)}
                    sx={{ minHeight: 48 }}
                  >
                    <ListItemIcon>
                      {section.icon}
                    </ListItemIcon>
                    <ListItemText primary={section.title} />
                    {expandedSections.includes(section.id) ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                
                <Collapse in={expandedSections.includes(section.id)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {section.pages.map(page => (
                      <ListItem 
                        key={page.id} 
                        disablePadding 
                        sx={{ pl: 4 }}
                      >
                        <ListItemButton
                          dense
                          onClick={() => handlePageSelect(page)}
                          selected={selectedPage?.id === page.id}
                          sx={{ borderLeft: selectedPage?.id === page.id ? `2px solid ${theme.palette.primary.main}` : 'none' }}
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <DocumentIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={page.title} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                    
                    {section.subsections?.map(subsection => (
                      <React.Fragment key={subsection.id}>
                        <ListItem 
                          disablePadding 
                          sx={{ pl: 4 }}
                        >
                          <ListItemButton
                            dense
                            onClick={() => handleSectionToggle(`${section.id}-${subsection.id}`)}
                          >
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <FolderIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={subsection.title} />
                            {expandedSections.includes(`${section.id}-${subsection.id}`) ? <ExpandLess /> : <ExpandMore />}
                          </ListItemButton>
                        </ListItem>
                        
                        <Collapse in={expandedSections.includes(`${section.id}-${subsection.id}`)} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding>
                            {subsection.pages.map(page => (
                              <ListItem 
                                key={page.id} 
                                disablePadding 
                                sx={{ pl: 7 }}
                              >
                                <ListItemButton
                                  dense
                                  onClick={() => handlePageSelect(page)}
                                  selected={selectedPage?.id === page.id}
                                  sx={{ borderLeft: selectedPage?.id === page.id ? `2px solid ${theme.palette.primary.main}` : 'none' }}
                                >
                                  <ListItemIcon sx={{ minWidth: 32 }}>
                                    <DocumentIcon fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary={page.title} />
                                </ListItemButton>
                              </ListItem>
                            ))}
                          </List>
                        </Collapse>
                      </React.Fragment>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
        )}
      </Drawer>
      
      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          overflowY: 'auto',
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: 0,
          ...(drawerOpen && !isMobile && {
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: '280px',
          }),
        }}
      >
        {/* Mobile Drawer Toggle */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mb: 2, ...(drawerOpen && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
          </Box>
        ) : selectedPage ? (
          <Box>
            {/* Breadcrumbs */}
            <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />} sx={{ mb: 2 }}>
              {generateBreadcrumbs(selectedPage).map((crumb, index, array) => (
                <Link
                  key={crumb.href}
                  color={index === array.length - 1 ? 'textPrimary' : 'inherit'}
                  href={crumb.href}
                  underline={index === array.length - 1 ? 'none' : 'hover'}
                  onClick={(e) => {
                    e.preventDefault();
                    // In a real app, this would navigate to the page
                  }}
                >
                  {crumb.text}
                </Link>
              ))}
            </Breadcrumbs>
            
            {/* Page Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {selectedPage.title}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedPage.tags.map(tag => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
              </Box>
              
              <Box>
                <Tooltip title={bookmarkedPages.includes(selectedPage.id) ? "Remove Bookmark" : "Add Bookmark"}>
                  <IconButton
                    onClick={() => handleBookmarkToggle(selectedPage.id)}
                    color={bookmarkedPages.includes(selectedPage.id) ? "primary" : "default"}
                  >
                    {bookmarkedPages.includes(selectedPage.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Copy Link">
                  <IconButton>
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Download as PDF">
                  <IconButton>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {/* Content Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Document" value="document" />
                <Tab label="Version History" value="history" />
                <Tab label="Metadata" value="metadata" />
              </Tabs>
            </Box>
            
            {/* Document Content */}
            {activeTab === 'document' && (
              <Box sx={{ py: 3 }}>
                {renderDocumentContent(selectedPage.content)}
              </Box>
            )}
            
            {/* Version History */}
            {activeTab === 'history' && (
              <Box sx={{ py: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Version History
                </Typography>
                
                <List>
                  <ListItem divider>
                    <ListItemIcon>
                      <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`v${selectedPage.version} - Latest Version`}
                      secondary={`Updated on ${formatDate(selectedPage.lastUpdated)} by ${selectedPage.contributors.join(', ')}`}
                    />
                  </ListItem>
                  
                  <ListItem divider>
                    <ListItemIcon>
                      <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="v0.9.0 - Beta Release"
                      secondary="Updated on April 1, 2025 by John Smith"
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="v0.5.0 - Initial Draft"
                      secondary="Updated on March 15, 2025 by Jane Doe"
                    />
                  </ListItem>
                </List>
              </Box>
            )}
            
            {/* Metadata */}
            {activeTab === 'metadata' && (
              <Box sx={{ py: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Document Details
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            ID
                          </Typography>
                          <Typography variant="body1">
                            {selectedPage.id}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Path
                          </Typography>
                          <Typography variant="body1">
                            {selectedPage.path}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Section
                          </Typography>
                          <Typography variant="body1">
                            {selectedPage.section}
                            {selectedPage.subsection && ` > ${selectedPage.subsection}`}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Tags
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {selectedPage.tags.map(tag => (
                              <Chip key={tag} label={tag} size="small" />
                            ))}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Version Information
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Current Version
                          </Typography>
                          <Typography variant="body1">
                            {selectedPage.version}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Last Updated
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(selectedPage.lastUpdated)}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Contributors
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {selectedPage.contributors.map(contributor => (
                              <Chip key={contributor} label={contributor} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Footer */}
            <Box sx={{ mt: 4, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="body2" color="textSecondary">
                Last updated: {formatDate(selectedPage.lastUpdated)} • Version: {selectedPage.version}
              </Typography>
              
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">
                  Was this document helpful?
                </Typography>
                
                <Box>
                  <Button startIcon={<EditIcon />} size="small">
                    Suggest Edits
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Alert severity="info">
            Select a document from the sidebar to view its contents.
          </Alert>
        )}
      </Box>
    </Box>
  );
};
