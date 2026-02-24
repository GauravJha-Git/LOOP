import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Project } from '../types';
import Navbar from '../components/Navbar';
import CreateProject from '../components/CreateProject';

const DashboardPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get('/projects/');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="page-shell">
      <div className="page-container stack-lg">
        <Navbar />

        <div className="stack-md">
          <div>
            <h2 className="page-title">Your Projects</h2>
            <p className="page-subtitle">Create a project and collect structured feedback from users.</p>
          </div>

          <CreateProject onProjectCreated={fetchProjects} />

          <section className="card stack-sm">
            <h3 className="section-title">Project List</h3>
            {projects.length === 0 ? (
              <p className="muted">You haven't created any projects yet.</p>
            ) : (
              <ul className="projects-grid">
                {projects.map((project) => (
                  <li key={project.id} className="project-card">
                    <Link className="project-link" to={`/project/${project.id}`}>
                      {project.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
