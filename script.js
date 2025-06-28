// Global variables
let blogs = JSON.parse(localStorage.getItem('blogs')) || [];
let currentBlogId = null;
let tempBlog = null;

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadSavedBlogs();
});

// Event listeners setup
function setupEventListeners() {
    document.getElementById('manualBtn').addEventListener('click', () => showForm('manual'));
    document.getElementById('apiBtn').addEventListener('click', () => showForm('api'));
    document.getElementById('manualFormElement').addEventListener('submit', handleManualSubmit);
    document.getElementById('apiFormElement').addEventListener('submit', handleApiSubmit);
}

// Show form based on type
function showForm(type) {
    const formSection = document.getElementById('formSection');
    const manualForm = document.getElementById('manualForm');
    const apiForm = document.getElementById('apiForm');

    hideBlogCard();

    formSection.classList.remove('hidden');
    formSection.classList.add('fade-in');

    if (type === 'manual') {
        manualForm.classList.remove('hidden');
        apiForm.classList.add('hidden');
    } else {
        apiForm.classList.remove('hidden');
        manualForm.classList.add('hidden');
    }

    setTimeout(() => {
        formSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Handle manual form submission
function handleManualSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('manualTitle').value.trim();
    const description = document.getElementById('manualDescription').value.trim();

    if (!title || !description) {
        showNotification('Please fill in all fields!', 'error');
        return;
    }

    const blog = {
        id: Date.now(),
        title,
        body: description,
        type: 'manual',
        timestamp: new Date().toISOString()
    };

    showBlogCard(blog);
    clearForm('manual');
}

// Handle API form submission
async function handleApiSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('apiTitle').value.trim();

    if (!title) {
        showNotification('Please enter a title to search!', 'error');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const posts = await response.json();
        const foundPost = posts.find(post => 
            post.title.toLowerCase().includes(title.toLowerCase())
        );

        showLoading(false);

        if (foundPost) {
            const blog = {
                id: foundPost.id,
                title: foundPost.title,
                body: foundPost.body,
                type: 'api',
                timestamp: new Date().toISOString()
            };
            showBlogCard(blog);
            clearForm('api');
        } else {
            showNotification('Blog not found!', 'error');
        }

    } catch (error) {
        showLoading(false);
        showNotification('Error fetching data. Please try again!', 'error');
        console.error('API Error:', error);
    }
}

// Show blog card
function showBlogCard(blog) {
    const blogCardSection = document.getElementById('blogCardSection');
    const container = document.getElementById('blogCardContainer');

    currentBlogId = blog.id;
    tempBlog = blog;

    const cardHTML = `
        <div class="blog-card rounded-2xl shadow-xl p-8 border border-gray-200 slide-in-up">
            <div class="text-center mb-6">
                <div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                    <i class="fas fa-file-alt text-white text-xl"></i>
                </div>
            </div>
            <div class="mb-8">
                <h4 class="text-2xl font-bold mb-4 text-gray-900 leading-tight">
                    ${escapeHtml(blog.title)}
                </h4>
                <p class="text-gray-700 leading-relaxed text-base">
                    ${escapeHtml(blog.body)}
                </p>
            </div>
            <div class="text-center pt-6 border-t border-gray-200">
                <button onclick="saveBlog(${blog.id})" 
                        class="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <i class="fas fa-save mr-2"></i>
                    Save Blog
                </button>
            </div>
        </div>
    `;

    container.innerHTML = cardHTML;
    blogCardSection.classList.remove('hidden');

    setTimeout(() => {
        blogCardSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Save blog to localStorage
function saveBlog(blogId) {
    if (tempBlog && tempBlog.id === blogId) {
        blogs.push(tempBlog);
        localStorage.setItem('blogs', JSON.stringify(blogs));
        
        hideBlogCard();
        loadSavedBlogs();
        showNotification('Blog saved successfully!', 'success');
        
        tempBlog = null;
        currentBlogId = null;

        setTimeout(() => {
            document.getElementById('savedBlogsSection').scrollIntoView({ behavior: 'smooth' });
        }, 300);
    }
}

// Load saved blogs from localStorage
function loadSavedBlogs() {
    const container = document.getElementById('savedBlogsContainer');
    
    if (blogs.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16">
                <div class="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <i class="fas fa-inbox text-3xl text-gray-400"></i>
                </div>
                <h4 class="text-xl font-semibold text-gray-600 mb-2">No saved blogs yet</h4>
                <p class="text-gray-500">Create and save your first blog to see it here!</p>
            </div>
        `;
        return;
    }

    const blogsHTML = blogs.map((blog, index) => `
        <div class="blog-card rounded-2xl shadow-lg p-6 border border-gray-200 slide-in-up" 
             style="animation-delay: ${index * 0.1}s" data-blog-id="${blog.id}">
            <div class="mb-5">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <h5 class="blog-title text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                            ${escapeHtml(blog.title)}
                        </h5>
                        <p class="blog-content text-gray-600 text-sm leading-relaxed line-clamp-3">
                            ${escapeHtml(blog.body.substring(0, 150))}${blog.body.length > 150 ? '...' : ''}
                        </p>
                    </div>
                    <div class="ml-3">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            blog.type === 'manual' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }">
                            <i class="fas ${blog.type === 'manual' ? 'fa-pen' : 'fa-cloud'} mr-1"></i>
                            ${blog.type}
                        </span>
                    </div>
                </div>
            </div>
            <div class="blog-actions flex justify-between items-center pt-4 border-t border-gray-100">
                <span class="text-xs text-gray-400 font-medium">
                    <i class="fas fa-calendar-alt mr-1"></i>
                    ${new Date(blog.timestamp).toLocaleDateString()}
                </span>
                <div class="flex gap-2">
                    <button onclick="editBlog(${blog.id})" 
                            class="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105">
                        <i class="fas fa-edit mr-1"></i>
                        Edit
                    </button>
                    <button onclick="deleteBlog(${blog.id})" 
                            class="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105">
                        <i class="fas fa-trash mr-1"></i>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = blogsHTML;
}

// Edit blog functionality - FIXED
function editBlog(blogId) {
    const blog = blogs.find(b => b.id === blogId);
    if (!blog) return;

    // Find the correct card using data attribute
    const card = document.querySelector(`[data-blog-id="${blogId}"]`);
    if (!card) return;

    const titleElement = card.querySelector('.blog-title');
    const contentElement = card.querySelector('.blog-content');
    const actionsDiv = card.querySelector('.blog-actions');

    // Hide original elements
    titleElement.style.display = 'none';
    contentElement.style.display = 'none';
    actionsDiv.style.display = 'none';

    // Create edit form
    const editHTML = `
        <div class="edit-form mb-4 p-4 bg-gray-50 rounded-xl">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold mb-2 text-gray-700">
                        <i class="fas fa-heading mr-1"></i> Blog Title
                    </label>
                    <input type="text" id="editTitle${blogId}" value="${escapeHtml(blog.title)}" 
                           class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-2 text-gray-700">
                        <i class="fas fa-align-left mr-1"></i> Blog Content
                    </label>
                    <textarea id="editBody${blogId}" rows="4" 
                              class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none">${escapeHtml(blog.body)}</textarea>
                </div>
                <div class="flex gap-3 pt-2">
                    <button onclick="saveEdit(${blogId})" 
                            class="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200">
                        <i class="fas fa-check mr-1"></i> Save Changes
                    </button>
                    <button onclick="cancelEdit(${blogId})" 
                            class="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200">
                        <i class="fas fa-times mr-1"></i> Cancel
                    </button>
                </div>
            </div>
        </div>
    `;

    // Insert edit form
    const editDiv = document.createElement('div');
    editDiv.innerHTML = editHTML;
    card.insertBefore(editDiv, actionsDiv);
}

// Save edited blog
function saveEdit(blogId) {
    const newTitle = document.getElementById(`editTitle${blogId}`).value.trim();
    const newBody = document.getElementById(`editBody${blogId}`).value.trim();

    if (!newTitle || !newBody) {
        showNotification('Please fill in all fields!', 'error');
        return;
    }

    const blogIndex = blogs.findIndex(b => b.id === blogId);
    if (blogIndex !== -1) {
        blogs[blogIndex].title = newTitle;
        blogs[blogIndex].body = newBody;
        blogs[blogIndex].timestamp = new Date().toISOString();

        localStorage.setItem('blogs', JSON.stringify(blogs));
        loadSavedBlogs();
        showNotification('Blog updated successfully!', 'success');
    }
}

// Cancel edit
function cancelEdit(blogId) {
    loadSavedBlogs();
}

// Delete blog
function deleteBlog(blogId) {
    const confirmed = confirm('Are you sure you want to delete this blog? This action cannot be undone.');
    
    if (confirmed) {
        blogs = blogs.filter(blog => blog.id !== blogId);
        localStorage.setItem('blogs', JSON.stringify(blogs));
        loadSavedBlogs();
        showNotification('Blog deleted successfully!', 'success');
    }
}

// Hide blog card
function hideBlogCard() {
    const blogCardSection = document.getElementById('blogCardSection');
    const container = document.getElementById('blogCardContainer');
    
    if (!blogCardSection.classList.contains('hidden')) {
        blogCardSection.classList.add('hidden');
        container.innerHTML = '';
    }
}

// Clear form inputs
function clearForm(type) {
    if (type === 'manual') {
        document.getElementById('manualTitle').value = '';
        document.getElementById('manualDescription').value = '';
    } else {
        document.getElementById('apiTitle').value = '';
    }
}

// Show/hide loading spinner
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.remove('hidden');
    } else {
        spinner.classList.add('hidden');
    }
}

// Show notification messages
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg transform translate-x-full transition-all duration-300 ${
        type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-3"></i>
            <span class="font-medium">${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}