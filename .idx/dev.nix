{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    pkgs.python3
    pkgs.ffmpeg
    pkgs.curl
    pkgs.yt-dlp
  ];
  idx = {
    extensions = [
      "ritwickdey.LiveServer"
    ];
    workspace = {
      onCreate = {
        npm-install = "npm install";
      };
      onStart = {
        # Optional: Run any background tasks on start
      };
    };
  };
}
