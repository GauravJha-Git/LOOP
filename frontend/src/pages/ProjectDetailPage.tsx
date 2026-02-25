import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import type { Feedback, FeedbackStatus, Project } from '../types';
import Navbar from '../components/Navbar';

const statusBadgeClassName: Record<FeedbackStatus, string> = {
  NEW: 'status-badge status-new',
  ACCEPTED: 'status-badge status-accepted',
  REJECTED: 'status-badge status-rejected',
  RESOLVED: 'status-badge status-resolved',
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
};

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [noteByFeedbackId, setNoteByFeedbackId] = useState<Record<number, string>>({});
  const [errorByFeedbackId, setErrorByFeedbackId] = useState<Record<number, string>>({});
  const [updatingFeedbackId, setUpdatingFeedbackId] = useState<number | null>(null);

  const fetchFeedback = useCallback(async () => {
    if (!id) {
      return;
    }
    const response = await api.get(`/projects/${id}/feedback`);
    setFeedback(response.data);
  }, [id]);

  useEffect(() => {
    const fetchProjectAndFeedback = async () => {
      if (!id) {
        setLoadError('Project ID is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        const [projectRes, feedbackRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/projects/${id}/feedback`),
        ]);
        setProject(projectRes.data);
        setFeedback(feedbackRes.data);
      } catch (error) {
        console.error('Failed to fetch project details', error);
        setLoadError('Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndFeedback();
  }, [id]);

  const handleStatusUpdate = async (feedbackItem: Feedback, nextStatus: FeedbackStatus) => {
    const note = noteByFeedbackId[feedbackItem.id]?.trim() ?? '';

    if (nextStatus === 'RESOLVED' && !note) {
      setErrorByFeedbackId((previous) => ({
        ...previous,
        [feedbackItem.id]: 'A resolution note is required before resolving feedback.',
      }));
      return;
    }

    setErrorByFeedbackId((previous) => ({
      ...previous,
      [feedbackItem.id]: '',
    }));

    try {
      setUpdatingFeedbackId(feedbackItem.id);
      await api.patch(`/feedback/${feedbackItem.id}/status`, {
        status: nextStatus,
        note: note || null,
      });
      await fetchFeedback();
      if (nextStatus !== 'RESOLVED') {
        setNoteByFeedbackId((previous) => ({
          ...previous,
          [feedbackItem.id]: '',
        }));
      }
    } catch (error) {
      console.error('Failed to update feedback status', error);
      setErrorByFeedbackId((previous) => ({
        ...previous,
        [feedbackItem.id]: 'Failed to update feedback status. Please try again.',
      }));
    } finally {
      setUpdatingFeedbackId(null);
    }
  };

  if (loading) {
    return <div className="page-shell"><div className="page-container card">Loading...</div></div>;
  }

  if (loadError) {
    return <div className="page-shell"><div className="page-container card">{loadError}</div></div>;
  }

  if (!project) {
    return <div className="page-shell"><div className="page-container card">Project not found.</div></div>;
  }

  return (
    <div className="page-shell">
      <div className="page-container stack-lg">
        <Navbar />

        <section className="card stack-sm">
          <h2 className="page-title">{project.name}</h2>
          <p className="page-subtitle">{project.description}</p>
          <p className="muted">
            Public feedback link:{' '}
            <a href={`/public/${project.public_slug}`} target="_blank" rel="noopener noreferrer">
              {`/public/${project.public_slug}`}
            </a>
          </p>
        </section>

        <section className="card stack-sm">
          <h3 className="section-title">Feedback</h3>
          {feedback.length === 0 ? (
            <p className="muted">No feedback received yet.</p>
          ) : (
            <ul className="feedback-list">
              {feedback.map((item) => {
                const canActOnNew = item.status === 'NEW';
                const canResolve = item.status === 'ACCEPTED';
                const noteLabel = canResolve ? 'Resolution note (required)' : 'Optional note';

                return (
                  <li key={item.id} className="feedback-item stack-sm">
                    <div className="feedback-header">
                      <strong>{item.type}</strong>
                      <span className={statusBadgeClassName[item.status]}>{item.status}</span>
                    </div>

                    <p>{item.description}</p>

                    <div className="feedback-details">
                      <span>Created: {formatDate(item.created_at)}</span>
                      <span>Submitter: {item.submitter_email || 'Not provided'}</span>
                    </div>

                    {(canActOnNew || canResolve) && (
                      <div className="feedback-actions stack-sm">
                        <label htmlFor={`note-${item.id}`} className="muted">{noteLabel}</label>
                        <textarea
                          id={`note-${item.id}`}
                          value={noteByFeedbackId[item.id] ?? ''}
                          onChange={(event) => {
                            const value = event.target.value;
                            setNoteByFeedbackId((previous) => ({
                              ...previous,
                              [item.id]: value,
                            }));
                          }}
                          placeholder={canResolve ? 'Describe how this was resolved...' : 'Add context (optional)...'}
                        />

                        <div className="feedback-action-row">
                          {canActOnNew && (
                            <>
                              <button
                                type="button"
                                className="btn btn-primary"
                                disabled={updatingFeedbackId === item.id}
                                onClick={() => handleStatusUpdate(item, 'ACCEPTED')}
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                className="btn"
                                disabled={updatingFeedbackId === item.id}
                                onClick={() => handleStatusUpdate(item, 'REJECTED')}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {canResolve && (
                            <button
                              type="button"
                              className="btn btn-primary"
                              disabled={updatingFeedbackId === item.id}
                              onClick={() => handleStatusUpdate(item, 'RESOLVED')}
                            >
                              Resolve
                            </button>
                          )}
                        </div>

                        {errorByFeedbackId[item.id] ? (
                          <p className="feedback-error">{errorByFeedbackId[item.id]}</p>
                        ) : null}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
