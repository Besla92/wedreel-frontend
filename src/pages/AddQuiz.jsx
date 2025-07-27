import { useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    IconButton,
    Button,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import axiosInstance from '../services/axiosInstance';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function AddQuiz() {
    const { event } = useAuth();
    const eventId = event?.id;
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const originalQuiz = useRef({ title: '', questions: [] });
    const [hasChanged, setHasChanged] = useState(false);

    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([
        {
            text: '',
            options: ['', '', '', ''],
            correctIndex: 0,
        }
    ]);

    // Existierendes Quiz laden
    useEffect(() => {
        console.log("📌 Event ID:", eventId);

        const fetchExistingQuiz = async () => {
            try {
                const res = await axiosInstance.get(`/api/events/${eventId}/quiz`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });

                console.log("Server-Quiz:", res.data);

                if (res.data?.questions?.length) {
                    const loadedQuestions = res.data.questions.map(q => {
                        const sortedOptions = [...q.options].sort((a, b) => a.position - b.position);

                        // Finde neue correctIndex anhand der Option-IDs
                        const correctOption = q.options[q.correctIndex];
                        const newCorrectIndex = sortedOptions.findIndex(
                            o => o.id === correctOption.id
                        );

                        return {
                            text: q.text,
                            options: sortedOptions.map(o => o.text),
                            correctIndex: newCorrectIndex
                        };
                    });

                    setTitle(res.data.title);
                    setQuestions(loadedQuestions);

                    originalQuiz.current = {
                        title: res.data.title,
                        questions: loadedQuestions
                    };
                }
            } catch (e) {
                console.log('Kein bestehendes Quiz gefunden oder Fehler:', e);
            }
        };

        if (eventId) {
            fetchExistingQuiz().then(r => {});
        }
    }, [eventId]);

    const addQuestion = () => {
        if (questions.length >= 10) return;
        setQuestions([...questions, {
            text: '',
            options: ['', '', '', ''],
            correctIndex: 0
        }]);
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
        setHasChanged(true); // 👈 Änderung sofort erkennen
    };

    const updateOption = (qIndex, optIndex, value) => {
        const updated = [...questions];
        updated[qIndex].options[optIndex] = value;
        setQuestions(updated);
        setHasChanged(true); // 👈 Änderung sofort erkennen
    };

    const submitQuiz = async () => {
        try {
            const payload = {
                title,
                questions: questions.map(q => ({
                    text: q.text,
                    options: q.options,
                    correctIndex: q.correctIndex
                }))
            };

            await axiosInstance.post(`/api/events/${eventId}/quiz/start`, payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            showNotification(t('quizCreatedSuccess'), 'success');
            navigate('/account');
        } catch (error) {
            console.error(error);
            showNotification(t('quizCreateError'), 'error');
        }
    };

    const commonStyles = {
        '& .MuiInputBase-input': {
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.1rem',
            color: '#5a4328',
        },
        '& .MuiInputLabel-root': {
            fontFamily: "'Playfair Display', serif",
            color: '#5a4328',
        },
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#fdfaf4',
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/account')} sx={{ color: '#5a4328' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 'bold',
                        color: '#5a4328',
                        fontFamily: "'Playfair Display', serif",
                    }}
                >
                    {t('createQuiz')}
                </Typography>
            </Box>

            <TextField
                fullWidth
                label={t('quizTitle')}
                value={title}
                onChange={(e) => {
                    setTitle(e.target.value);
                    setHasChanged(true);
                }}
                variant="outlined"
                margin="normal"
                sx={commonStyles}
            />

            {questions.map((q, qIndex) => (
                <Box key={qIndex} sx={{ border: '1px solid #ccc', p: 2, borderRadius: 2, mb: 2 }}>
                    <TextField
                        fullWidth
                        label={`${t('question')} ${qIndex + 1}`}
                        value={q.text}
                        onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                        variant="outlined"
                        margin="normal"
                        sx={commonStyles}
                    />

                    <RadioGroup
                        value={q.correctIndex}
                        onChange={(e) => updateQuestion(qIndex, 'correctIndex', parseInt(e.target.value))}
                    >
                        {q.options.map((opt, optIndex) => (
                            <FormControlLabel
                                key={optIndex}
                                value={optIndex}
                                control={<Radio sx={{ color: '#5a4328', mt: 1.5 }} />}
                                label={
                                    <TextField
                                        value={opt}
                                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                        placeholder={`${t('answerOption')} ${optIndex + 1}`}
                                        variant="outlined"
                                        sx={{
                                            width: '100%',
                                            ...commonStyles
                                        }}
                                    />
                                }
                                sx={{
                                    alignItems: 'center',
                                    display: 'flex',
                                    gap: 2,
                                    mb: 1
                                }}
                            />
                        ))}
                    </RadioGroup>

                    {questions.length > 1 && (
                        <Button
                            onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))}
                            size="small"
                            startIcon={<DeleteIcon />}
                            sx={{ mt: 1, color: '#b33a3a', textTransform: 'none' }}
                        >
                            {t('deleteQuestion')}
                        </Button>
                    )}
                </Box>
            ))}

            {questions.length < 10 && (
                <Button
                    fullWidth
                    onClick={addQuestion}
                    variant="outlined"
                    startIcon={<AddIcon />}
                    sx={{
                        mb: 3,
                        color: '#5a4328',
                        borderColor: '#5a4328',
                        fontFamily: "'Playfair Display', serif",
                        textTransform: 'none',
                    }}
                >
                    {t('addQuestion')}
                </Button>
            )}

            <Box sx={{ mt: 2, display: 'flex' }}>
                <Button
                    variant="contained"
                    onClick={submitQuiz}
                    disabled={
                        questions.length < 3 ||
                        !title.trim() ||
                        questions.some(q => !q.text.trim() || q.options.some(o => !o.trim())) ||
                        !hasChanged
                    }
                    sx={{
                        backgroundColor: '#5a4328',
                        color: '#fff',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 'bold',
                        '&:disabled': { backgroundColor: '#ccc' }
                    }}
                >
                    {t('saveQuiz')}
                </Button>
            </Box>
        </Box>
    );
}
