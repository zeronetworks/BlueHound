PWD=~/PycharmProjects/bluehound/
APPNAME=BlueHound

cd $PWD

npm run-script build
npm pack
rm -rf target
mkdir target
mv *.tgz target/
cd target/
tar -xvf *.tgz
rm -f *.tgz
mv package/build package/dist
cp package/dist/favicon.ico package/favicon.ico

# Remove certificates and keys
rm package/*.cert
rm package/*.pem

GRAPH_APP_PASSPHRASE=$( cat ../desktop.passphrase )

# sign the code & verify
npx @neo4j/code-signer --app ./package --private-key ../neo4j-labs-app.pem --cert ../neo4j-labs-app.cert --passphrase $GRAPH_APP_PASSPHRASE
npx @neo4j/code-signer --verify  --app ./package --root-cert ../neo4j_desktop.cert

# pack it back up again
cd package
npm pack
mv *.tgz ../

# remove the package folder
rm -rf package
cd ..
# verify it again
tar xvf *.tgz package

npx @neo4j/code-signer --verify \
  --app ./package \
  --root-cert ../neo4j_desktop.cert

rm -rf package

# Publish to npm
npm publish --access public bluehound*.tgz