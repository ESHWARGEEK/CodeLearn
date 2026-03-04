import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/learning/technologies/route';

describe('GET /api/learning/technologies', () => {
  it('should return a list of technologies', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.technologies).toBeInstanceOf(Array);
    expect(data.data.technologies.length).toBeGreaterThan(0);
  });

  it('should return technologies with required fields', async () => {
    const response = await GET();
    const data = await response.json();

    const tech = data.data.technologies[0];
    expect(tech).toHaveProperty('id');
    expect(tech).toHaveProperty('name');
    expect(tech).toHaveProperty('description');
    expect(tech).toHaveProperty('icon');
    expect(tech).toHaveProperty('projectCount');
  });

  it('should return technologies with valid data types', async () => {
    const response = await GET();
    const data = await response.json();

    const tech = data.data.technologies[0];
    expect(typeof tech.id).toBe('string');
    expect(typeof tech.name).toBe('string');
    expect(typeof tech.description).toBe('string');
    expect(typeof tech.icon).toBe('string');
    expect(typeof tech.projectCount).toBe('number');
  });

  it('should include popular technologies', async () => {
    const response = await GET();
    const data = await response.json();

    const techIds = data.data.technologies.map((t: any) => t.id);
    expect(techIds).toContain('react');
    expect(techIds).toContain('nextjs');
    expect(techIds).toContain('nodejs');
  });
});
