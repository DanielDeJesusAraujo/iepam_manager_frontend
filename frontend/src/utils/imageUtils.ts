export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMAGES_API_KEY}`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
    }

    const data = await response.json();
    return data.data.url;
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