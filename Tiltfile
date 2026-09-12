# TDK Restaurant Operations Landscape Tiltfile
# Dining reservations, kitchen throughput, and floor operations

v1alpha1.extension_repo(name='tdk-cli', url='https://github.com/tdk-landscape/tdk-cli')
v1alpha1.extension(name='tdk-cli', repo_name='tdk-cli', repo_path='')

load('ext://tdk-cli', 'Utils', 'Manifest', 'Config')

print("TDK Restaurant Operations Landscape")
print("   Project -> Stacks: guest, kitchen, operations")
print("   Resources: 6 restaurant service resources")
print("")

config.define_string_list("to-run", args=True)
cfg = config.parse()
