import { useState } from 'react';
import {
    Box,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    LinearProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function QuizStepper({ quiz, onSubmit }) {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});

    const total = quiz.questions.length;
    const currentQuestion = quiz.questions[currentStep];

    const handleChange = (step, value) => {
        setAnswers((prev) => ({
            ...prev,
            [step]: parseInt(value, 10),
        }));
    };

    const handleSubmit = () => {
        onSubmit(answers);
    };

    return (
        <Box>
            {/* Fortschrittsbalken */}
            <Box sx={{ mb: 3 }}>
                <LinearProgress
                    variant="determinate"
                    value={((currentStep + 1) / total) * 100}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#e0cfc1',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: '#5a4328',
                        },
                    }}
                />
            </Box>

            {/* Aktuelle Frage */}
            <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
                    {currentStep + 1}. {currentQuestion.text}
                </Typography>
                <RadioGroup
                    value={answers[currentStep] ?? ''}
                    onChange={(e) => handleChange(currentStep, e.target.value)}
                >
                    {currentQuestion.options.map((opt) => (
                        <FormControlLabel
                            key={opt.position}
                            value={opt.position}
                            control={<Radio />}
                            label={opt.text}
                        />
                    ))}
                </RadioGroup>
            </Box>

            {/* Navigation */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    disabled={currentStep === 0}
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    variant="outlined"
                >
                    {t('back')}
                </Button>

                {currentStep < total - 1 ? (
                    <Button
                        disabled={answers[currentStep] === undefined}
                        onClick={() => setCurrentStep((prev) => prev + 1)}
                        variant="contained"
                        sx={{ backgroundColor: '#5a4328', '&:hover': { backgroundColor: '#7c6245' } }}
                    >
                        {t('next')}
                    </Button>
                ) : (
                    <Button
                        disabled={answers[currentStep] === undefined}
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{ backgroundColor: '#5a4328', '&:hover': { backgroundColor: '#7c6245' } }}
                    >
                        {t('submit')}
                    </Button>
                )}
            </Box>
        </Box>
    );
}
