import React, { useState, useRef, useEffect } from 'react';
import { placesService } from '../../services/placesService';
import type { Place } from '../../models/Place.model';

interface PlaceChatbotProps {
    place: Place;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
}

const PlaceChatbot: React.FC<PlaceChatbotProps> = ({ place }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            text: `¡Hola! Soy tu asistente virtual para ${place.name}. ¿Qué te gustaría saber sobre este lugar? Puedes preguntarme sobre su dificultad, ubicación, horarios o cualquier otra duda.`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: input
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const data = await placesService.chatWithPlace(place.id, userMessage.text);
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: data.response
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error al chatear con la IA:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: 'Lo siento, tuve un problema al procesar tu pregunta. Por favor intenta nuevamente.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[400px] md:h-[500px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-eco-primary-600 text-white p-3 md:p-4 flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold text-base md:text-lg">Asistente Virtual</h3>
                    <p className="text-eco-primary-100 text-xs md:text-sm truncate max-w-[200px] md:max-w-none">Pregunta sobre {place.name}</p>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-3 md:p-4 shadow-sm text-sm md:text-base ${msg.role === 'user'
                                ? 'bg-eco-primary-600 text-white rounded-tr-none'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}
                        >
                            <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-none p-3 md:p-4 shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 md:p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe tu pregunta..."
                        className="flex-grow p-2.5 md:p-3 text-sm md:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-eco-primary-400 focus:outline-none transition-all min-w-0"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-2.5 md:p-3 bg-eco-primary-600 text-white rounded-xl hover:bg-eco-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shrink-0"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PlaceChatbot;
