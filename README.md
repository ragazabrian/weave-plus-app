# weave+ app

An ASP.NET Core Razor Pages web app.

[**View the source**](https://github.com/ragazabrian/weave-plus-app) · Live link: coming soon on Render

## What it does

This is the starting scaffold for weave+ — a Razor Pages site with a home page, a privacy page, and standard error handling, ready to build product features on top of.

## How it is made

Built with ASP.NET Core 10 (Razor Pages) and Bootstrap for layout and styling. No frontend build step is required — pages are server-rendered `.cshtml` views backed by C# page models.

## Run locally

Requires the [.NET SDK](https://dotnet.microsoft.com/download) (10.0 or later).

```bash
dotnet run
```

Then visit the URL printed in the terminal (typically `https://localhost:5001` or `http://localhost:5000`).

## Deploy

The repo includes a `Dockerfile` and `render.yaml`, so it deploys to [Render](https://render.com) as a Docker web service:

1. Push changes to `main`.
2. On Render, create a new **Web Service** from this repository (or use **Blueprint** deploy, which picks up `render.yaml` automatically).
3. Render builds the `Dockerfile` and serves the app on the assigned URL.

## Project structure

```text
weave+ app/
├── Program.cs
├── weave+ app.csproj
├── Dockerfile
├── render.yaml
├── Pages/
│   ├── Index.cshtml
│   ├── Privacy.cshtml
│   ├── Error.cshtml
│   └── Shared/
│       └── _Layout.cshtml
├── wwwroot/
│   ├── css/
│   ├── js/
│   └── lib/
└── Properties/
    └── launchSettings.json
```

## License

Released under the [MIT License](LICENSE).
