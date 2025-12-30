import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, feedbackAPI, adminAPI } from '../services/api';
import Layout from '../components/Layout';
import TeamStats from '../components/TeamStats';
import FeedbackForm from '../components/FeedbackForm';
import FeedbackStats from '../components/FeedbackStats';
import CategoryStats from '../components/CategoryStats';
import FeedbackHistory from '../components/FeedbackHistory';
import KudosForm from '../components/KudosForm';
import KudosBadgesLegend from '../components/KudosBadgesLegend';
import UserKudosBadges from '../components/UserKudosBadges';
import { calculateFeedbackStats, PERIOD_OPTIONS, getSinceDate } from '../utils/constants';
import { AlertCircle, UserCircle } from 'lucide-react';

const ManagerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('manager');
    const [subordinates, setSubordinates] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeFeedback, setEmployeeFeedback] = useState([]);
    const [myFeedback, setMyFeedback] = useState([]);
    const [myFullFeedback, setMyFullFeedback] = useState([]);
    const [allTeamFeedback, setAllTeamFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [myCategoryStats, setMyCategoryStats] = useState([]);
    const [selectedEmployeeCategoryStats, setSelectedEmployeeCategoryStats] = useState([]);
    const [badges, setBadges] = useState([]);
    const [period, setPeriod] = useState('all');

    useEffect(() => {
        loadData();
    }, [period]);

    useEffect(() => {
        if (selectedEmployee) {
            loadEmployeeFeedback(selectedEmployee.id);
        }
    }, [selectedEmployee, period]);

    const loadData = async () => {
        try {
            setLoading(true);
            const since = getSinceDate(period);
            const [subsData, myFeedbackData, myFullData, teamFeedbackData, myCatStats, configData] = await Promise.all([
                userAPI.getSubordinates(),
                feedbackAPI.getMyFeedback(since),
                feedbackAPI.getMyFeedback(null),
                feedbackAPI.getTeamFeedback(since),
                feedbackAPI.getUserCategoryStats(user.id, since),
                adminAPI.getConfig()
            ]);

            setSubordinates(subsData);
            setMyFeedback(myFeedbackData);
            setMyFullFeedback(myFullData);
            setAllTeamFeedback(teamFeedbackData);
            setMyCategoryStats(myCatStats);
            setBadges(configData.kudos_badges || []);

            if (subsData.length > 0) {
                setSelectedEmployee(subsData[0]);
            }

            setError('');
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Nu s-au putut încărca datele. Vă rugăm încercați din nou.');
        } finally {
            setLoading(false);
        }
    };

    const loadEmployeeFeedback = async (employeeId) => {
        try {
            const since = getSinceDate(period);
            const [data, catStats] = await Promise.all([
                feedbackAPI.getEmployeeFeedback(employeeId, since),
                feedbackAPI.getUserCategoryStats(employeeId, since)
            ]);
            setEmployeeFeedback(data);
            setSelectedEmployeeCategoryStats(catStats);
        } catch (err) {
            console.error('Failed to load employee feedback:', err);
        }
    };

    const handleFeedbackSuccess = () => {
        loadData();
        if (selectedEmployee) {
            loadEmployeeFeedback(selectedEmployee.id);
        }
    };

    const myStats = calculateFeedbackStats(myFeedback);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-slate-600 dark:text-slate-400">Se încarcă...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-8">
                {/* Welcome Header */}
                <div className="fade-in flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center flex-wrap">
                            Bun venit, {user?.name}!
                            <UserKudosBadges feedback={myFullFeedback} />
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Gestionează echipa ta și oferă feedback angajaților.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Perioadă:
                        </label>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                        >
                            {PERIOD_OPTIONS.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            <button
                                onClick={loadData}
                                className="text-sm text-red-600 dark:text-red-400 hover:underline mt-2"
                            >
                                Încearcă din nou
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="card">
                    <div className="border-b border-slate-200 dark:border-slate-700">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('manager')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'manager'
                                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                📊 Ca Manager
                            </button>
                            <button
                                onClick={() => setActiveTab('employee')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'employee'
                                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                👤 Ca Angajat
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Manager Tab */}
                {activeTab === 'manager' && (
                    <div className="space-y-8 fade-in">
                        {/* Team Statistics */}
                        <TeamStats subordinates={subordinates} allFeedback={allTeamFeedback} />

                        {subordinates.length === 0 ? (
                            <div className="card">
                                <div className="card-body text-center py-12">
                                    <p className="text-slate-500 dark:text-slate-400">
                                        Nu ai subordonați în sistem.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Employee Selection */}
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                            <UserCircle className="w-5 h-5 mr-2" />
                                            Subordonații tăi
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        <label htmlFor="employee-select" className="label">
                                            Alege persoana
                                        </label>
                                        <select
                                            id="employee-select"
                                            value={selectedEmployee?.id || ''}
                                            onChange={(e) => {
                                                const emp = subordinates.find(
                                                    (s) => s.id === parseInt(e.target.value)
                                                );
                                                setSelectedEmployee(emp);
                                            }}
                                            className="input"
                                        >
                                            {subordinates.map((sub) => (
                                                <option key={sub.id} value={sub.id}>
                                                    {sub.name} — {sub.functia} ({sub.departament})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Feedback Form */}
                                {selectedEmployee && (
                                    <FeedbackForm
                                        selectedEmployee={selectedEmployee}
                                        onSuccess={handleFeedbackSuccess}
                                    />
                                )}

                                {/* Selected Employee Stats */}
                                {selectedEmployee && employeeFeedback.length > 0 && (
                                    <>
                                        <FeedbackStats
                                            stats={calculateFeedbackStats(employeeFeedback)}
                                            title={`📊 Rezultate pentru ${selectedEmployee.name}`}
                                        />
                                        <CategoryStats stats={selectedEmployeeCategoryStats} />
                                        <FeedbackHistory
                                            feedbackList={employeeFeedback}
                                            title="Istoric feedback"
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Employee Tab */}
                {activeTab === 'employee' && (
                    <div className="space-y-8 fade-in">
                        <KudosForm currentUser={user} onSuccess={loadData} />
                        <FeedbackStats stats={myStats} title="📊 Rezultate personale" />
                        <CategoryStats stats={myCategoryStats} />
                        <FeedbackHistory feedbackList={myFeedback} />
                        <KudosBadgesLegend badges={badges} />
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ManagerDashboard;
