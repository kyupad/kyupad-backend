interface ICatnipAssetsSnapshotBody {
  user_id: string;
  project_id: string;
  catnip_assets?: {
    [key: string]: string[];
  };
}

export { ICatnipAssetsSnapshotBody };
