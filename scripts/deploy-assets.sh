#!/bin/bash
# ==============================================================================
# Script de Despliegue y Automatización de Activos — Quiral POS
# Pasos: 1. Validación -> 2. Copia -> 3. Squash Git -> 4. Push
# ==============================================================================
set -euo pipefail

# Configuración de rutas
SRC_DIR="/c/Users/Sebas/Pictures/icons"
DEST_DIR="./public"
TARGET_BRANCH="main"

echo "=========================================================="
echo "🚀 Quiral POS — Automatización de Iconos y Squash Git"
echo "=========================================================="

# ------------------------------------------------------------------------------
# 1. VALIDACIÓN DE ARCHIVOS Y DIMENSIONES
# ------------------------------------------------------------------------------
echo ""
echo "🔍 [Paso 1/4] Validando existencia y dimensiones de activos..."

# Detección flexible del archivo de favicon (faviicon.ico, favicon.ico o favicon.png)
if [ -f "${SRC_DIR}/faviicon.ico" ]; then
    FAVICON_SRC="${SRC_DIR}/faviicon.ico"
    FAVICON_DEST_NAME="favicon.ico"
elif [ -f "${SRC_DIR}/favicon.ico" ]; then
    FAVICON_SRC="${SRC_DIR}/favicon.ico"
    FAVICON_DEST_NAME="favicon.ico"
elif [ -f "${SRC_DIR}/favicon.png" ]; then
    FAVICON_SRC="${SRC_DIR}/favicon.png"
    FAVICON_DEST_NAME="favicon.png"
else
    echo "❌ [ERROR CRÍTICO] No se encontró 'faviicon.ico' ni 'favicon.png' en ${SRC_DIR}."
    exit 1
fi

ICON_SRC="${SRC_DIR}/iconquiral.png"

if [ ! -f "$ICON_SRC" ]; then
    echo "❌ [ERROR CRÍTICO] No se encontró el icono principal en ${ICON_SRC}."
    exit 1
fi

# Función portátil para obtener dimensiones exactas (identify -> magick -> powershell)
get_image_dimensions() {
    local file_path="$1"
    local dims=""

    if command -v identify >/dev/null 2>&1; then
        dims=$(identify -format "%wx%h" "$file_path" 2>/dev/null | head -n 1)
    elif command -v magick >/dev/null 2>&1; then
        dims=$(magick identify -format "%wx%h" "$file_path" 2>/dev/null | head -n 1)
    elif command -v powershell.exe >/dev/null 2>&1; then
        local win_path
        if command -v cygpath >/dev/null 2>&1; then
            win_path=$(cygpath -w "$file_path")
        else
            win_path="$file_path"
        fi
        dims=$(powershell.exe -NoProfile -Command "
            Add-Type -AssemblyName System.Drawing
            try {
                \$img = [System.Drawing.Image]::FromFile('$win_path')
                Write-Output (\"{0}x{1}\" -f \$img.Width, \$img.Height)
                \$img.Dispose()
            } catch {
                exit 1
            }
        " 2>/dev/null | tr -d '\r')
    fi

    if [ -z "$dims" ]; then
        echo "0x0"
    else
        echo "$dims"
    fi
}

FAV_DIMS=$(get_image_dimensions "$FAVICON_SRC")
ICON_DIMS=$(get_image_dimensions "$ICON_SRC")

echo "   ℹ️  Favicon detectado (${FAVICON_SRC}): ${FAV_DIMS}"
echo "   ℹ️  Icono Quiral detectado (${ICON_SRC}): ${ICON_DIMS}"

FAV_W=$(echo "$FAV_DIMS" | cut -d'x' -f1)
FAV_H=$(echo "$FAV_DIMS" | cut -d'x' -f2)

ICON_W=$(echo "$ICON_DIMS" | cut -d'x' -f1)
ICON_H=$(echo "$ICON_DIMS" | cut -d'x' -f2)

if [ "${FAV_W:-0}" -le 0 ] || [ "${FAV_H:-0}" -le 0 ]; then
    echo "❌ [ERROR CRÍTICO] Dimensiones inválidas o archivo ilegible en: $FAVICON_SRC"
    exit 1
fi

if [ "${ICON_W:-0}" -lt 192 ] || [ "${ICON_H:-0}" -lt 192 ]; then
    echo "❌ [ERROR CRÍTICO] Dimensiones insuficientes en $ICON_SRC (${ICON_DIMS}). Mínimo requerido: 192x192."
    exit 1
fi

if [ "$ICON_W" -ne "$ICON_H" ]; then
    echo "❌ [ERROR CRÍTICO] El icono de Quiral POS debe tener relación de aspecto 1:1 (cuadrado). Detectado: ${ICON_DIMS}."
    exit 1
fi

echo "   ✅ Validación de existencia y dimensiones superada exitosamente."

# ------------------------------------------------------------------------------
# 2. COPIA Y RENOMBRADO A ./public/
# ------------------------------------------------------------------------------
echo ""
echo "📦 [Paso 2/4] Copiando y normalizando activos en ${DEST_DIR}..."

if [ ! -d "$DEST_DIR" ]; then
    echo "❌ [ERROR CRÍTICO] El directorio destino ${DEST_DIR} no existe en el proyecto."
    exit 1
fi

# Copia de favicon a ./public/
cp -f "$FAVICON_SRC" "${DEST_DIR}/${FAVICON_DEST_NAME}"
echo "   ✅ Favicon actualizado: ${DEST_DIR}/${FAVICON_DEST_NAME}"

# Si el origen es un archivo .ico, sincronizar también favicon.ico y favicon.png si corresponde
if [[ "$FAVICON_SRC" == *.ico ]]; then
    cp -f "$FAVICON_SRC" "${DEST_DIR}/favicon.ico"
elif [[ "$FAVICON_SRC" == *.png ]]; then
    cp -f "$FAVICON_SRC" "${DEST_DIR}/favicon.png"
fi

# Copia de icono principal y compatibilidad PWA
cp -f "$ICON_SRC" "${DEST_DIR}/iconquiral.png"
cp -f "$ICON_SRC" "${DEST_DIR}/icon-512.png"
cp -f "$ICON_SRC" "${DEST_DIR}/icon-192.png"
echo "   ✅ Iconos PWA actualizados en ${DEST_DIR} (iconquiral.png, icon-512.png, icon-192.png)."

# ------------------------------------------------------------------------------
# 3. CONTROL DE GIT, SQUASH Y COMMIT ESTANDARIZADO
# ------------------------------------------------------------------------------
echo ""
echo "🌿 [Paso 3/4] Validando integridad de Git y ejecutando squash..."

# Validar que estamos en un repositorio Git
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "❌ [ERROR CRÍTICO] Este directorio no es un repositorio Git válido."
    exit 1
fi

# Restringir estrictamente el despliegue a la rama main
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
    echo "❌ [ERROR DE SEGURIDAD] El despliegue a producción está restringido exclusivamente a la rama '$TARGET_BRANCH'."
    echo "   Rama actual detectada: '$CURRENT_BRANCH'"
    echo "   Por favor, cambia a la rama $TARGET_BRANCH (git checkout $TARGET_BRANCH) antes de ejecutar el despliegue."
    exit 1
fi

# Comprobar que existe un commit padre para hacer squash
PARENT_COMMIT=$(git rev-parse --verify HEAD^ 2>/dev/null || true)
if [ -z "$PARENT_COMMIT" ]; then
    echo "❌ [ERROR CRÍTICO] No se encontró un commit anterior (HEAD^) para realizar el squash."
    exit 1
fi

# Agregar los nuevos archivos copiados en public/
git add "${DEST_DIR}"

# Ejecutar el squash del último commit manteniendo los cambios staged
echo "   🔄 Ejecutando 'git reset --soft HEAD^' para consolidar cambios..."
git reset --soft HEAD^

# Asegurar que todos los cambios queden indexados en el nuevo commit
git add -A

COMMIT_MSG="feat(assets): actualizar iconografia oficial, favicons y normalizar historial"
git commit -m "$COMMIT_MSG"
echo "   ✅ Nuevo commit consolidado generado: $(git rev-parse --short HEAD)"

# ------------------------------------------------------------------------------
# 4. DESPLIEGUE SEGURO CON FORCE-WITH-LEASE
# ------------------------------------------------------------------------------
echo ""
echo "🚀 [Paso 4/4] Desplegando hacia origin/${TARGET_BRANCH} de forma segura..."

git push origin "${TARGET_BRANCH}" --force-with-lease

echo ""
echo "=========================================================="
echo "🎉 ¡Despliegue y squash completados exitosamente en ${TARGET_BRANCH}!"
echo "=========================================================="
