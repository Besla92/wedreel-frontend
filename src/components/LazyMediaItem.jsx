import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function LazyMediaItem({ item, index, onClick, view }) {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

    const isImage = item.type === 'image';

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {inView && (
                <Box
                    onClick={() => onClick(index)}
                    sx={{
                        position: 'relative',
                        borderRadius: 2,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        aspectRatio: view === 'list' ? '3 / 2' : '1', // rechteckig bei Listenansicht
                        width: '100%',
                    }}
                >
                    {isImage ? (
                        <img
                            src={item.url}
                            alt={`Media ${index}`}
                            loading="lazy"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <>
                            <video
                                src={item.url}
                                muted
                                preload="none"
                                playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    color: 'white',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    borderRadius: '50%',
                                    width: 48,
                                    height: 48,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 28,
                                }}
                            >
                                ▶
                            </Box>
                        </>
                    )}
                </Box>
            )}
        </motion.div>
    );
}
