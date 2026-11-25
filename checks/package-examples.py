from argparse import ArgumentParser
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

root = Path(__file__).resolve().parents[1]
packages = [
    ('paper-order-lab', root / 'lab', 'paper-order-lab/'),
    ('order-guide-starter', root / 'examples/order-guide-starter', ''),
]
parser = ArgumentParser(description='Package the runnable lab and unfinished teaching example.')
parser.add_argument('--check', action='store_true', help='compare archive paths and bytes with the editable sources')
args = parser.parse_args()
for name, source, prefix in packages:
    files = {prefix + p.relative_to(source).as_posix(): p for p in sorted(source.rglob('*')) if p.is_file()}
    if args.check:
        with ZipFile(root / 'public' / (name + '.zip')) as archive:
            if sorted(archive.namelist()) != sorted(files):
                raise SystemExit('Different archive layout in ' + name)
            for member, path in files.items():
                if archive.read(member) != path.read_bytes():
                    raise SystemExit('Stale archived file: ' + member)
        print('Verified', name, 'against', len(files), 'source files')
        continue
    with ZipFile(root / 'public' / (name + '.zip'), 'w') as archive:
        for member_name, path in files.items():
            member = ZipInfo(member_name)
            member.compress_type = ZIP_DEFLATED
            member.external_attr = 0o100644 << 16
            archive.writestr(member, path.read_bytes())
