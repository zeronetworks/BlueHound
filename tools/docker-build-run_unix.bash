#!/bin/bash

args=$(getopt -l "port:" -o "p:h" -- "$@")

eval set -- "$args"

while [ $# -ge 1 ]; do
        case "$1" in
                --)
                    # No more options left.
                    shift
                    break
                   ;;
                -p|--port|port)
                        port="$2"
                        shift
                        ;;
                -h)
                        echo "Run this script with a '--port 8080' argument to run BlueHound on http://localhost:8080."
                        exit 0
                        ;;
        esac

        shift
done

port=${port:-'8080'}
docker build . -t bluehound
echo "-----------------------------------------------"
echo "bluehound is available at http://localhost:$port."
echo "-----------------------------------------------"
docker run -it --rm -p $port:80 bluehound