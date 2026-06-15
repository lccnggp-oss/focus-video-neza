#!/usr/bin/env python3
"""
Generador de thumbnails y gallery.json para galería estática de fotógrafo.
Uso: python generador.py <carpeta_cliente> <codigo>
Ejemplo: python generador.py boda-juan-ana boda2024
"""

import sys
import json
import os
import hashlib
from pathlib import Path
from PIL import Image

THUMB_PREFIX = "thumb_"
THUMB_WIDTH = 400
EXTENSIONES = {'.jpg', '.jpeg', '.png'}

def hash_codigo(codigo: str) -> str:
    return hashlib.sha256(codigo.encode()).hexdigest()

def generar_thumbnail(ruta_original: Path, ruta_thumb: Path):
    """Genera un thumbnail de ancho THUMB_WIDTH si no existe."""
    if ruta_thumb.exists():
        return
    try:
        with Image.open(ruta_original) as img:
            img = img.convert("RGB")  # Asegurar modo RGB para JPEG
            width_percent = THUMB_WIDTH / float(img.size[0])
            height = int(float(img.size[1]) * width_percent)
            img_resized = img.resize((THUMB_WIDTH, height), Image.LANCZOS)
            ruta_thumb.parent.mkdir(parents=True, exist_ok=True)
            img_resized.save(ruta_thumb, "JPEG", quality=85)
    except Exception as e:
        print(f"Error generando thumbnail para {ruta_original}: {e}")

def escanear_sesiones(cliente_dir: Path) -> dict:
    sesiones = {}
    for subdir in sorted(cliente_dir.iterdir()):
        if subdir.is_dir():
            imagenes = []
            for archivo in sorted(subdir.iterdir()):
                if archivo.suffix.lower() in EXTENSIONES and not archivo.name.startswith(THUMB_PREFIX):
                    imagenes.append(archivo.name)
                    # Generar thumbnail
                    thumb_path = subdir / f"{THUMB_PREFIX}{archivo.name}"
                    generar_thumbnail(archivo, thumb_path)
            if imagenes:
                sesiones[subdir.name] = imagenes
    return sesiones

def main():
    if len(sys.argv) != 3:
        print("Uso: python generador.py <carpeta_cliente> <codigo>")
        sys.exit(1)

    cliente = sys.argv[1]
    codigo = sys.argv[2]
    cliente_path = Path(cliente)
    if not cliente_path.exists() or not cliente_path.is_dir():
        print(f"Error: la carpeta '{cliente}' no existe")
        sys.exit(1)

    # Generar thumbnails y recolectar sesiones
    sesiones = escanear_sesiones(cliente_path)
    if not sesiones:
        print(f"Advertencia: No se encontraron imágenes en subcarpetas de '{cliente}'")

    # Crear gallery.json
    gallery = {
        "codigo_hash": hash_codigo(codigo),
        "sesiones": sesiones
    }
    json_path = cliente_path / "gallery.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(gallery, f, indent=2, ensure_ascii=False)

    print(f"✅ gallery.json generado en {json_path}")
    print(f"   Código hasheado: {gallery['codigo_hash']}")
    print(f"   Sesiones encontradas: {list(sesiones.keys())}")

if __name__ == "__main__":
    main()