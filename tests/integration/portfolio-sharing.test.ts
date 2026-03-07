import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createProject, updateProjectDeployment } from '@/lib/db/projects';
import { updatePortfolioSettings, getPortfolioSettings } from '@/lib/db/portfolio-settings';

describe('Portfolio Sharing Integration', () => {
  const testUserId = 'test-user-sharing';
  const testProjectId = 'test-project-sharing';

  beforeEach(async () => {
    // Clean up any existing test data
    // In a real test, you'd want to clean up the database
  });

  afterEach(async () => {
    // Clean up test data
    // In a real test, you'd want to clean up the database
  });

  it('should complete portfolio sharing workflow', async () => {
    // 1. Create a test project
    const project = await createProject(testProjectId, testUserId, {
      name: 'Test Sharing Project',
      technology: 'react',
      type: 'learning',
      githubSourceUrl: 'https://github.com/test/sharing-project',
    });

    expect(project.name).toBe('Test Sharing Project');
    expect(project.status).toBe('active');

    // 2. Deploy the project (simulate completion)
    await updateProjectDeployment(
      testProjectId,
      testUserId,
      'https://sharing-project.vercel.app',
      'vercel'
    );

    // 3. Check default portfolio settings (should be private)
    const defaultSettings = await getPortfolioSettings(testUserId);
    expect(defaultSettings.isPublic).toBe(false);
    expect(defaultSettings.showGithubLinks).toBe(true);
    expect(defaultSettings.showTechStack).toBe(true);

    // 4. Make portfolio public
    await updatePortfolioSettings(testUserId, {
      isPublic: true,
      showGithubLinks: true,
      showTechStack: true,
      customDescription: 'My test portfolio for sharing',
    });

    // 5. Verify settings were updated
    const updatedSettings = await getPortfolioSettings(testUserId);
    expect(updatedSettings.isPublic).toBe(true);
    expect(updatedSettings.customDescription).toBe('My test portfolio for sharing');

    // 6. Test public portfolio API access
    const publicResponse = await fetch(`/api/portfolio/public/${testUserId}`);
    expect(publicResponse.status).toBe(200);

    const publicData = await publicResponse.json();
    expect(publicData.success).toBe(true);
    expect(publicData.data.settings.isPublic).toBe(true);
    expect(publicData.data.user.bio).toBe('My test portfolio for sharing');

    // 7. Make portfolio private again
    await updatePortfolioSettings(testUserId, {
      isPublic: false,
      showGithubLinks: true,
      showTechStack: true,
    });

    // 8. Verify public API now returns 403
    const privateResponse = await fetch(`/api/portfolio/public/${testUserId}`);
    expect(privateResponse.status).toBe(403);

    const privateData = await privateResponse.json();
    expect(privateData.success).toBe(false);
    expect(privateData.error.code).toBe('PORTFOLIO_PRIVATE');
  });

  it('should respect GitHub link visibility settings', async () => {
    // 1. Create and deploy a project
    await createProject(testProjectId + '-github', testUserId, {
      name: 'GitHub Visibility Test',
      technology: 'vue',
      type: 'learning',
      githubSourceUrl: 'https://github.com/test/github-test',
    });

    await updateProjectDeployment(
      testProjectId + '-github',
      testUserId,
      'https://github-test.netlify.app',
      'netlify'
    );

    // 2. Make portfolio public but hide GitHub links
    await updatePortfolioSettings(testUserId, {
      isPublic: true,
      showGithubLinks: false,
      showTechStack: true,
    });

    // 3. Verify GitHub links are hidden in public view
    const response = await fetch(`/api/portfolio/public/${testUserId}`);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.projects[0].githubUrl).toBe('');
    expect(data.data.settings.showGithubLinks).toBe(false);
  });

  it('should handle portfolio filtering in public view', async () => {
    // 1. Create multiple projects with different technologies
    await createProject(testProjectId + '-react', testUserId, {
      name: 'React Project',
      technology: 'react',
      type: 'learning',
    });

    await createProject(testProjectId + '-vue', testUserId, {
      name: 'Vue Project',
      technology: 'vue',
      type: 'learning',
    });

    // Deploy both projects
    await updateProjectDeployment(
      testProjectId + '-react',
      testUserId,
      'https://react-project.vercel.app',
      'vercel'
    );

    await updateProjectDeployment(
      testProjectId + '-vue',
      testUserId,
      'https://vue-project.vercel.app',
      'vercel'
    );

    // 2. Make portfolio public
    await updatePortfolioSettings(testUserId, {
      isPublic: true,
      showGithubLinks: true,
      showTechStack: true,
    });

    // 3. Test filtering by technology
    const reactResponse = await fetch(`/api/portfolio/public/${testUserId}?technology=react`);
    const reactData = await reactResponse.json();

    expect(reactData.success).toBe(true);
    expect(reactData.data.projects).toHaveLength(1);
    expect(reactData.data.projects[0].technology).toBe('react');

    // 4. Test search functionality
    const searchResponse = await fetch(`/api/portfolio/public/${testUserId}?search=Vue`);
    const searchData = await searchResponse.json();

    expect(searchData.success).toBe(true);
    expect(searchData.data.projects).toHaveLength(1);
    expect(searchData.data.projects[0].name).toBe('Vue Project');
  });
});