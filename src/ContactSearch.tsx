import React, { useState } from 'react';
import connection from './eWayAPI/Connector';
import { TContactsResopnse } from './eWayAPI/ContactsResponse';
import './ContactSearch.css';

type ContactType = {
    [key: string]: unknown;
};

const MAX_RECENT = 3;

const ContactSearch: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [contact, setContact] = useState<ContactType | null>(null);

    const [recentSearches, setRecentSearches] = useState<string[]>(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as string[];
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }
        return [];
    });

    const getProfilePictureSrc = (pic: string) => {
        if (!pic) return null;
        if (/^https?:\/\//.test(pic)) return pic;
        if (pic.length > 100) {
            let mime = 'image/jpeg';
            if (pic.startsWith('iVBOR')) mime = 'image/png';
            if (pic.startsWith('/9j')) mime = 'image/jpeg';
            return `data:${mime};base64,${pic}`;
        }
        return null;
    };

    const handleSearch = (searchEmail?: string) => {
        const emailToSearch = searchEmail || email;
        if (!emailToSearch) return;

        setLoading(true);
        setError(null);
        setContact(null);

        connection.callMethod(
            'SearchContacts',
            {
                transmitObject: { Email1Address: emailToSearch },
                includeProfilePictures: true
            },
            (result: TContactsResopnse) => {
                setLoading(false);
                if (result.Data.length > 0) {
                    setContact(result.Data[0] as ContactType);

                    // Add to recent searches and save in localStorage
                    setRecentSearches(prev => {
                        const newList = [emailToSearch, ...prev.filter(e => e !== emailToSearch)].slice(0, MAX_RECENT);
                        localStorage.setItem('recentSearches', JSON.stringify(newList));
                        return newList;
                    });
                } else {
                    setError('No contact found for this email.');
                }
            }
        );
    };

    const profileSrc = contact?.ProfilePicture && typeof contact.ProfilePicture === 'string'
        ? getProfilePictureSrc(contact.ProfilePicture)
        : null;

    return (
        <div className="contact-search-container">
            {/* Email Input */}
            <label htmlFor="emailInput" className="input-label">Contact Email</label>
            <input
                id="emailInput"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter email address"
                disabled={loading}
                className="email-input"
            />

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
                <div className="recent-searches">
                    <span>Recent searches:</span>
                    {recentSearches.map((item, index) => (
                        <button
                            key={index}
                            className="recent-search-button"
                            onClick={() => handleSearch(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            )}

            {/* Search Button */}
            <button
                onClick={() => handleSearch()}
                disabled={!email || loading}
                className="search-button"
            >
                {loading ? 'Searching...' : 'Search'}
            </button>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Contact Card */}
            {contact && (
                <div className="contact-card">
                    {profileSrc ? (
                        <img src={profileSrc} alt="Profile" className="profile-picture" />
                    ) : (
                        <div className="profile-placeholder">?</div>
                    )}

                    <div className="contact-info">
                        <h2 className="contact-name">
                            {String(contact.FileAs || contact.FullName || 'No Name')}
                        </h2>
                        <div className="contact-field">
                            <strong>Email:</strong> {String(contact.Email1Address || 'N/A')}
                        </div>
                        {typeof contact.TelephoneNumber1Normalized === 'string' && contact.TelephoneNumber1Normalized && (
                            <div className="contact-field">
                                <strong>Phone:</strong> {String(contact.TelephoneNumber1Normalized)}
                            </div>
                        )}
                        {typeof contact.BusinessAddressCity === 'string' && contact.BusinessAddressCity && (
                            <div className="contact-field">
                                <strong>City:</strong> {String(contact.BusinessAddressCity)}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactSearch;
