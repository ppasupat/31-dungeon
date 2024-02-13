#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Pack the sprites.
Depends on Pillow and PyTexturePacker.
"""
import argparse
import json

from PyTexturePacker import Packer


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-v', '--verbose', action='store_true')
    args = parser.parse_args()

    packer = Packer.create(
        max_width=8128,
        max_height=8128,
        trim_mode=0,
        atlas_format='json',
        enable_rotated=False,
        force_square=False,
        )
    packer.pack('img/sprites/', 'img/sheet')

    # Generate CSS file
    with open('img/sheet.json') as fin:
        data = json.load(fin)
    with open('img/sheet.css', 'w') as fout:
        for k in sorted(data['frames']):
            print('Dumping CSS for {}'.format(k))
            assert '.png' in k, k
            frame = data['frames'][k]['frame']
            class_names = ['.' + k.replace('.png', '')]
            if k.startswith('npc-'):
                # Also create map icon
                _, name, idx = k.replace('.png', '').split('-')
                if idx == '0':
                    class_names.append('.map-{} > .msp'.format(name))
                else:
                    class_names.append('.map-{}.map-{}-{} > .msp'.format(
                        name, name, idx))
            print(', '.join(class_names), '{', file=fout)
            print('  background-position: -{}px -{}px;'.format(
                frame['x'], frame['y']), file=fout)
            print('  width: {}px; height: {}px;'.format(
                frame['w'], frame['h']), file=fout)
            print('}', file=fout)


if __name__ == '__main__':
    main()

