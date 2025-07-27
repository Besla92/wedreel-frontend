import { useEffect, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../services/axiosInstance';
import { useAuth } from '../context/AuthContext';
import QuizStepper from '../components/QuizStepper';

export default function Quiz() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { event } = useAuth();

    const [quiz, setQuiz] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!event) return;

            try {
                const token = localStorage.getItem('token');
                const response = await axiosInstance.get(`/api/events/${event.id}/quiz`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setQuiz(response.data);

                if (response.data.result) {
                    setScore(response.data.result.score);
                    setSubmitted(true);

                    const lbResponse = await axiosInstance.get(`/api/quiz/${response.data.id}/leaderboard`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setLeaderboard(lbResponse.data);
                }
            } catch (err) {
                console.error('Quiz konnte nicht geladen werden:', err);
            }
        };

        fetchQuiz();
    }, [event]);

    const handleSubmitAnswers = async (answers) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.post(
                `/api/quiz/${quiz.id}/submit`,
                { answers },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setScore(response.data.score);
            setSubmitted(true);

            const lbResponse = await axiosInstance.get(`/api/quiz/${quiz.id}/leaderboard`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLeaderboard(lbResponse.data);
        } catch (err) {
            console.error('Antworten konnten nicht übermittelt werden:', err);
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: 900, mx: 'auto', backgroundColor: '#fdfbf7', minHeight: '100vh' }}>
            {/* Zurück-Button + Überschrift */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: '#5a4328' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#5a4328' }}>
                    {t('quizTitle')}
                </Typography>
            </Box>

            {!quiz && <Typography>{t('loading')}...</Typography>}

            {quiz && !submitted && (
                <QuizStepper quiz={quiz} onSubmit={handleSubmitAnswers} />
            )}

            {submitted && (
                <Box>
                    <Typography variant="h6" sx={{ mt: 4, color: '#5a4328' }}>
                        {t('yourScore')}: {score} / {quiz.questions.length}
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 4, mb: 1, color: '#5a4328' }}>
                        {t('leaderboard')}
                    </Typography>

                    <Box sx={{ backgroundColor: '#fff', borderRadius: 2, p: 2, boxShadow: 1 }}>
                        {leaderboard.length === 0 ? (
                            <Typography>{t('noResultsYet')}</Typography>
                        ) : (
                            leaderboard.map((entry, idx) => (
                                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                    <Typography>{idx + 1}. {entry.firstname} {entry.lastname}</Typography>
                                    <Typography>{entry.score} {t('points')}</Typography>
                                </Box>
                            ))
                        )}
                    </Box>
                </Box>
            )}
        </Box>
    );
}
