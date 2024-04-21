import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';

const getMerkleRootString = (wallets: string[]): string => {
  wallets.sort();
  const leafNode = wallets.map((addr) => keccak256(addr));
  const merkleTree = new MerkleTree(leafNode, keccak256, {
    sortPairs: true,
  });
  const merkle_root = merkleTree.getRoot();
  return merkle_root.toString('hex');
};

const getMerkleProof2 = (wallets: string[], wallet: string): number[][] => {
  wallets.sort();
  const leafNode = wallets.map((addr) => keccak256(addr));
  const merkleTree = new MerkleTree(leafNode, keccak256, { sortPairs: true });
  const getProof = merkleTree.getProof(keccak256(wallet));
  return getProof.map((item) => Array.from(item.data));
};

const getMerkleProof = (
  wallets: string[],
  wallet: string,
): { position: 'left' | 'right'; data: string }[] => {
  wallets.sort();
  const leafNode = wallets.map((addr) => keccak256(addr));
  const merkleTree = new MerkleTree(leafNode, keccak256, { sortPairs: true });
  const merkleRoofBuffer = merkleTree.getProof(keccak256(wallet));
  return merkleRoofBuffer.map((mr) => {
    return {
      ...mr,
      data: mr.data.toString('hex'),
    };
  });
};

const getMerkleTree = (wallets: string[]): MerkleTree => {
  wallets.sort();
  const leafNode = wallets.map((addr) => keccak256(addr));
  return new MerkleTree(leafNode, keccak256, { sortPairs: true });
};

export { getMerkleRootString, getMerkleProof, getMerkleTree, getMerkleProof2 };
