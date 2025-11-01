import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfile(user);
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          Profile not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="card-title mb-0">Profile</h2>
                <button className="btn btn-outline-danger" onClick={logout}>
                  Logout
                </button>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <h5>Personal Information</h5>
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>Name:</strong></td>
                        <td>{profile.name}</td>
                      </tr>
                      <tr>
                        <td><strong>Email:</strong></td>
                        <td>{profile.email}</td>
                      </tr>
                      <tr>
                        <td><strong>Phone:</strong></td>
                        <td>{profile.phone}</td>
                      </tr>
                      <tr>
                        <td><strong>WhatsApp:</strong></td>
                        <td>{profile.whatsapp}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="col-md-6">
                  <h5>Academic Information</h5>
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>Year:</strong></td>
                        <td>{profile.year}</td>
                      </tr>
                      <tr>
                        <td><strong>Branch:</strong></td>
                        <td>{profile.branch}</td>
                      </tr>
                      <tr>
                        <td><strong>Rating:</strong></td>
                        <td>
                          {profile.rating > 0 ? (
                            <span>⭐ {profile.rating}/5 ({profile.totalRatings} ratings)</span>
                          ) : (
                            <span className="text-muted">No ratings yet</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Member Since:</strong></td>
                        <td>{new Date(profile.createdAt).toLocaleDateString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4">
                <h5>Account Status</h5>
                <div className="d-flex gap-2">
                  <span className={`badge ${profile.isVerified ? 'bg-success' : 'bg-warning'}`}>
                    {profile.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
