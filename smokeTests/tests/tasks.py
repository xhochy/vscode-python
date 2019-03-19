# # Copyright (c) Microsoft Corporation. All rights reserved.
# # Licensed under the MIT License.


# import os.path
# import time

# import invoke
# from behave import __main__

# from .vscode import application, download, setup


# @invoke.task(
#     name="download",
#     help={
#         "destination": "Directory where VS Code will be downloaded, files will be created.",
#         "channel": "Whether to download the stable or insiders build of VS Code",
#     },
# )
# def download_all(ctx, destination=".vscode-smoke", channel="stable"):
#     """Download VS Code (stable/insiders) and chrome driver.

#     The channel defines the channel for VSC (stable or insiders).
#     """
#     destination = os.path.join(destination, "vscode")
#     download.download_vscode(destination, channel)
#     download.download_chrome_driver(destination, channel)


# @invoke.task(name="install")
# def install_ext(ctx, destination=".vscode-smoke", vsix="ms-python-insiders.vsix"):
#     """Installs the Python Extension into VS Code in preparation for the smoke tests"""
#     vsix = os.path.abspath(vsix)
#     options = application.get_options(destination, vsix)
#     application.install_extension(options)


# @invoke.task(
#     name="launch", help={"timeout": "Time after which VS Code will be closed."}
# )
# def launch(
#     ctx, timeout=30, destination=".vscode-smoke", vsix="ms-python-insiders.vsix"
# ):
#     """Launches VS Code (the same instance used for smoke tests)"""
#     vsix = os.path.abspath(vsix)
#     options = application.get_options(destination, vsix)
#     setup.start(options)
#     time.sleep(30)


# @invoke.task(
#     name="smoke",
#     help={
#         "output": "Whether to send output to the console or a file (console/file).",
#         "embed_screenshots": "Whether to embed screenshots into the report or save as a separate file.",
#         "destination": "Directory where VS Code will be downloaded, files will be created.",
#         "channel": "Whether to download the stable or insiders build of VS Code",
#         "vsix": "Path to the extension file (vsix)",
#     },
# )
# def smoke(
#     ctx,
#     output="console",
#     embed_screenshots=True,
#     destination=".vscode-smoke",
#     channel="stable",
#     vsix="ms-python-insiders.vsix",
# ):
#     """Start the smoke tests"""
#     report_args = [
#         "-f",
#         "tasks.smoketests.utils.report:PrettyCucumberJSONFormatter",
#         "-o",
#         os.path.join(destination, "reports", "report.json"),
#         "-D",
#         f"embed_screenshots={embed_screenshots}",
#     ]
#     stdout_args = [
#         "-f",
#         "plain",
#         "-T",
#         "--no-capture",
#         "-D",
#         f"embed_screenshots=False",
#     ]
#     args = report_args if output == "file" else stdout_args
#     __main__.main(args + ["-D", f"output={output}", "tasks/smoketests"])