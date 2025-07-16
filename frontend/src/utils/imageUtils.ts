export const uploadImage = async (file: File): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_IMAGES_API_KEY;
    
    console.log('Verificando chave da API:', apiKey ? 'Configurada' : 'Não configurada');
    
    if (!apiKey) {
        console.error('Chave da API de imagens não configurada. Configure NEXT_PUBLIC_IMAGES_API_KEY no arquivo .env.local');
        throw new Error('Chave da API de imagens não configurada. Configure NEXT_PUBLIC_IMAGES_API_KEY no arquivo .env.local');
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
    });

        console.log('Resposta da API ImgBB:', response);

    if (!response.ok) {
            const errorData = await response.text();
            console.error('Erro na resposta da API ImgBB:', response.status, errorData);
            throw new Error(`Erro ao fazer upload da imagem: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
        
        // Verificar se a resposta foi bem-sucedida conforme a documentação
        if (!data.success || data.status !== 200) {
            console.error('Resposta de erro da API ImgBB:', data);
            throw new Error(`Erro na API ImgBB: ${data.error?.message || 'Erro desconhecido'}`);
        }

        if (!data.data || !data.data.url) {
            console.error('Resposta inválida da API ImgBB:', data);
            throw new Error('Resposta inválida da API de upload');
        }

        console.log('Upload bem-sucedido:', {
            id: data.data.id,
            url: data.data.url,
            size: data.data.size,
            filename: data.data.image?.filename
        });

    return data.data.url;
    } catch (error) {
        console.error('Erro no upload da imagem:', error);
        throw error;
    }
};

export const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setSelectedImage: (file: File | null) => void,
    setPreviewUrl: (url: string) => void
) => {
    const file = e.target.files?.[0];
    if (file) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
};