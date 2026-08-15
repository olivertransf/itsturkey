import { FC } from 'react'
import { Skeleton } from '@components/system'
import { StyledSkeletonProfile } from './'

const SkeletonProfile: FC = () => {
  return (
    <StyledSkeletonProfile>
      <div className="skel-identity">
        <Skeleton variant="circular" height={44} width={44} />
        <Skeleton height={14} width={200} noBorder />
      </div>
      <div className="skel-tabs">
        <Skeleton height={28} width={64} noBorder />
        <Skeleton height={28} width={64} noBorder />
        <Skeleton height={28} width={64} noBorder />
      </div>
      <div className="skel-panel">
        <div className="skel-hero">
          <Skeleton height={56} noBorder />
          <Skeleton height={56} noBorder />
          <Skeleton height={56} noBorder />
        </div>
        <div className="skel-meta">
          <Skeleton height={36} noBorder />
          <Skeleton height={36} noBorder />
          <Skeleton height={36} noBorder />
          <Skeleton height={36} noBorder />
        </div>
      </div>
    </StyledSkeletonProfile>
  )
}

export default SkeletonProfile
