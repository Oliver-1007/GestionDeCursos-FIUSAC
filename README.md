# Panel Académico

Panel personal para seguir tu avance en Ingeniería en Sistemas: pensum con prerrequisitos, cursos aprobados y en curso, notas, calendario mensual, proyectos, notas personales y estadísticas.

Es un sitio estático (HTML + CSS + JavaScript), sin backend ni base de datos y sin costo. Tus datos se guardan en el `localStorage` de tu navegador.

## Estructura

```
index.html
css/styles.css
js/pensum.js   <- pensum de la carrera (editable)
js/app.js      <- lógica de la aplicación
```

## Probar en local

Abre `index.html` en el navegador. Si prefieres un servidor local:

```bash
npx serve .
```

## Subir a GitHub

```bash
git init
git add .
git commit -m "Panel académico"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/panel-academico.git
git push -u origin main
```

## Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. Pulsa **Add New... > Project** e importa el repositorio `panel-academico`.
3. Deja **Framework Preset** en `Other`, sin comando de build ni carpeta de salida.
4. Pulsa **Deploy**.

Cada `git push` a `main` vuelve a desplegar el sitio automáticamente.

## Actualizar el pensum

Reemplaza el objeto de `js/pensum.js` con el contenido de tu `pensum.json` (mantén `const P = ...;`). Tu progreso se guarda por código de curso, así que no se pierde.

## Datos personales

Viven solo en el navegador donde los uses. Para llevarlos a otro dispositivo, usa **Configuración > Exportar mis datos** y luego **Importar mis datos**. Haz un respaldo de vez en cuando.
