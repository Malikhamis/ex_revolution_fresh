/**
 * Unit Tests for Content Store
 * Testing data management and CRUD operations
 */

const ContentStore = require('../../data/content-store');

describe('ContentStore', () => {
    let contentStore;
    
    beforeEach(() => {
        // Create a fresh instance for each test
        contentStore = new ContentStore();
    });

    describe('Blog Posts', () => {
        describe('createBlogPost', () => {
            test('should create a new blog post with valid data', () => {
                const blogData = {
                    title: 'Test Blog Post',
                    excerpt: 'This is a test excerpt',
                    content: 'This is the test content',
                    author: 'Test Author',
                    category: 'Technology',
                    tags: ['test', 'blog'],
                    status: 'published'
                };
                
                const result = contentStore.createBlogPost(blogData);
                
                expect(result).toHaveProperty('id');
                expect(result.title).toBe(blogData.title);
                expect(result.author).toBe(blogData.author);
                expect(result.status).toBe(blogData.status);
                expect(result).toHaveProperty('createdAt');
                expect(result).toHaveProperty('slug');
            });
            
            test('should generate slug from title', () => {
                const blogData = {
                    title: 'This is a Test Blog Post!',
                    excerpt: 'Test excerpt',
                    content: 'Test content',
                    author: 'Test Author',
                    category: 'Technology'
                };
                
                const result = contentStore.createBlogPost(blogData);
                
                expect(result.slug).toBe('this-is-a-test-blog-post');
            });
            
            test('should throw error for missing required fields', () => {
                const invalidData = {
                    title: 'Test Post'
                    // Missing required fields
                };
                
                expect(() => {
                    contentStore.createBlogPost(invalidData);
                }).toThrow();
            });
            
            test('should set default values for optional fields', () => {
                const blogData = {
                    title: 'Test Blog Post',
                    excerpt: 'Test excerpt',
                    content: 'Test content',
                    author: 'Test Author',
                    category: 'Technology'
                };
                
                const result = contentStore.createBlogPost(blogData);
                
                expect(result.status).toBe('draft');
                expect(result.featured).toBe(false);
                expect(result.tags).toEqual([]);
            });
        });
        
        describe('getAllBlogPosts', () => {
            test('should return all blog posts', () => {
                const posts = contentStore.getAllBlogPosts();
                
                expect(Array.isArray(posts)).toBe(true);
                expect(posts.length).toBeGreaterThan(0);
            });
        });
        
        describe('getPublishedBlogPosts', () => {
            test('should return only published blog posts', () => {
                // Create a draft post
                contentStore.createBlogPost({
                    title: 'Draft Post',
                    excerpt: 'Draft excerpt',
                    content: 'Draft content',
                    author: 'Test Author',
                    category: 'Technology',
                    status: 'draft'
                });
                
                const publishedPosts = contentStore.getPublishedBlogPosts();
                
                expect(Array.isArray(publishedPosts)).toBe(true);
                publishedPosts.forEach(post => {
                    expect(post.status).toBe('published');
                });
            });
        });
        
        describe('updateBlogPost', () => {
            test('should update existing blog post', () => {
                const originalPost = contentStore.createBlogPost({
                    title: 'Original Title',
                    excerpt: 'Original excerpt',
                    content: 'Original content',
                    author: 'Test Author',
                    category: 'Technology'
                });
                
                const updates = {
                    title: 'Updated Title',
                    status: 'published'
                };
                
                const updatedPost = contentStore.updateBlogPost(originalPost.id, updates);
                
                expect(updatedPost.title).toBe('Updated Title');
                expect(updatedPost.status).toBe('published');
                expect(updatedPost.excerpt).toBe('Original excerpt'); // Unchanged
            });
            
            test('should throw error for non-existent post', () => {
                expect(() => {
                    contentStore.updateBlogPost(999, { title: 'Updated' });
                }).toThrow('Blog post not found');
            });
        });
        
        describe('deleteBlogPost', () => {
            test('should delete existing blog post', () => {
                const post = contentStore.createBlogPost({
                    title: 'To Delete',
                    excerpt: 'Delete excerpt',
                    content: 'Delete content',
                    author: 'Test Author',
                    category: 'Technology'
                });
                
                const result = contentStore.deleteBlogPost(post.id);
                
                expect(result).toBe(true);
                expect(() => {
                    contentStore.getBlogPost(post.id);
                }).toThrow('Blog post not found');
            });
            
            test('should return false for non-existent post', () => {
                const result = contentStore.deleteBlogPost(999);
                
                expect(result).toBe(false);
            });
        });
    });

    describe('Case Studies', () => {
        describe('createCaseStudy', () => {
            test('should create a new case study with valid data', () => {
                const caseStudyData = {
                    title: 'Test Case Study',
                    excerpt: 'Test excerpt',
                    content: 'Test content',
                    client: 'Test Client',
                    industry: 'Technology',
                    projectType: 'Website Development',
                    status: 'published'
                };
                
                const result = contentStore.createCaseStudy(caseStudyData);
                
                expect(result).toHaveProperty('id');
                expect(result.title).toBe(caseStudyData.title);
                expect(result.client).toBe(caseStudyData.client);
                expect(result.industry).toBe(caseStudyData.industry);
                expect(result).toHaveProperty('createdAt');
                expect(result).toHaveProperty('slug');
            });
        });
        
        describe('getAllCaseStudies', () => {
            test('should return all case studies', () => {
                const caseStudies = contentStore.getAllCaseStudies();
                
                expect(Array.isArray(caseStudies)).toBe(true);
                expect(caseStudies.length).toBeGreaterThan(0);
            });
        });
        
        describe('getPublishedCaseStudies', () => {
            test('should return only published case studies', () => {
                const publishedCaseStudies = contentStore.getPublishedCaseStudies();
                
                expect(Array.isArray(publishedCaseStudies)).toBe(true);
                publishedCaseStudies.forEach(caseStudy => {
                    expect(caseStudy.status).toBe('published');
                });
            });
        });
    });

    describe('Contacts', () => {
        describe('createContact', () => {
            test('should create a new contact with valid data', () => {
                const contactData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    subject: 'General Inquiry',
                    message: 'This is a test message'
                };
                
                const result = contentStore.createContact(contactData);
                
                expect(result).toHaveProperty('id');
                expect(result.name).toBe(contactData.name);
                expect(result.email).toBe(contactData.email);
                expect(result.subject).toBe(contactData.subject);
                expect(result.message).toBe(contactData.message);
                expect(result).toHaveProperty('createdAt');
                expect(result.status).toBe('new');
            });
            
            test('should throw error for invalid email', () => {
                const invalidData = {
                    name: 'Test User',
                    email: 'invalid-email',
                    subject: 'General Inquiry',
                    message: 'Test message'
                };
                
                expect(() => {
                    contentStore.createContact(invalidData);
                }).toThrow();
            });
        });
        
        describe('getAllContacts', () => {
            test('should return all contacts', () => {
                const contacts = contentStore.getAllContacts();
                
                expect(Array.isArray(contacts)).toBe(true);
            });
        });
        
        describe('updateContactStatus', () => {
            test('should update contact status', () => {
                const contact = contentStore.createContact({
                    name: 'Test User',
                    email: 'test@example.com',
                    subject: 'General Inquiry',
                    message: 'Test message'
                });
                
                const updatedContact = contentStore.updateContactStatus(contact.id, 'responded');
                
                expect(updatedContact.status).toBe('responded');
            });
        });
    });

    describe('Quotes', () => {
        describe('createQuote', () => {
            test('should create a new quote with valid data', () => {
                const quoteData = {
                    name: 'Test Client',
                    email: 'client@example.com',
                    projectType: 'Website Development',
                    description: 'Test project description',
                    budget: '$5,000 - $15,000',
                    timeline: '1 month'
                };
                
                const result = contentStore.createQuote(quoteData);
                
                expect(result).toHaveProperty('id');
                expect(result.name).toBe(quoteData.name);
                expect(result.email).toBe(quoteData.email);
                expect(result.projectType).toBe(quoteData.projectType);
                expect(result).toHaveProperty('createdAt');
                expect(result.status).toBe('new');
            });
        });
        
        describe('getAllQuotes', () => {
            test('should return all quotes', () => {
                const quotes = contentStore.getAllQuotes();
                
                expect(Array.isArray(quotes)).toBe(true);
            });
        });
    });

    describe('Utility Methods', () => {
        describe('generateSlug', () => {
            test('should generate valid slug from title', () => {
                const title = 'This is a Test Title with Special Characters!@#';
                const slug = contentStore.generateSlug(title);
                
                expect(slug).toBe('this-is-a-test-title-with-special-characters');
                expect(slug).toMatch(/^[a-z0-9-]+$/);
            });
            
            test('should handle empty title', () => {
                const slug = contentStore.generateSlug('');
                
                expect(slug).toBe('');
            });
            
            test('should handle title with only special characters', () => {
                const slug = contentStore.generateSlug('!@#$%^&*()');
                
                expect(slug).toBe('');
            });
        });
    });
});
