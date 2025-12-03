#!/bin/bash
echo "🚀 GENERANDO THUMBNAILS WEBP ULTRA-RÁPIDOS PARA LA TIENDA MÁS RÁPIDA DE URUGUAY..."

# Instalar ImageMagick si no lo tenés
if ! command -v convert &> /dev/null; then
    echo "🔧 Instalando ImageMagick..."
    sudo apt update && sudo apt install -y imagemagick
fi

# Crear carpeta de thumbs
mkdir -p images/products/thumbs

cont=0

# Procesar imágenes con expansión segura de patrones
shopt -s nullglob nocaseglob   # ← esto arregla el problema

for img in images/products/*.{jpg,jpeg,png,webp} images/*.{jpg,jpeg,png,webp}; do
    [[ -f "$img" ]] || continue
    
    filename=$(basename "$img")
    name="${filename%.*}"
    
    convert "$img" \
        -resize 350x350^ \
        -gravity center \
        -extent 350x350 \
        -quality 78 \
        -strip \
        "images/products/thumbs/${name}-thumb.webp"
    
    echo "✅ $filename → ${name}-thumb.webp"
    ((cont++))
done

# Si no encontró ninguna imagen, aviso lindo
if [ $cont -eq 0 ]; then
    echo "⚠️  No encontré imágenes en images/ ni images/products/"
    echo "   Subí las fotos de croquetas, frutas, gaseosas, etc. y volvé a ejecutar"
else
    echo ""
    echo "🎉 ¡ÉXITO TOTAL REY! Generé $cont thumbnails WEBP"
    echo "   Cada una pesa ~30-60 KB → carga en 4G en 0.3 segundos"
fi

# Imagen por defecto
if [ ! -f "images/products/thumbs/no-image-thumb.webp" ]; then
    convert -size 350x350 xc:#1a1a1a \
        -gravity center -pointsize 40 -fill #00ffff \
        -annotate +0+0 "SIN FOTO" \
        -quality 78 images/products/thumbs/no-image-thumb.webp
    echo "✅ Imagen por defecto creada"
fi

echo ""
echo "👉 Ahora subí todo con:"
echo "git add . && git commit -m 'feat: thumbnails WEBP ultra-rápidos' && git push"
